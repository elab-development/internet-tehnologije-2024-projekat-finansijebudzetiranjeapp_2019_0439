<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Account;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    // Middleware should be applied in the routes file, not in the controller constructor.

    /**
     * Prikazuje sve korisnike sa statistikama (samo za admin)
     */
    public function index(Request $request)
    {
        try {
            $perPage = $request->query('per_page', 15);
            $page = $request->query('page', 1);

            // Osnovni query sa eager loading
            $query = User::with(['accounts', 'categories']);

            // Filtriranje po ulozi ako je prosleđeno
            if ($request->has('role')) {
                $query->where('role', $request->query('role'));
            }

            // Pretraga po imenu ili email-u
            if ($request->has('search')) {
                $search = $request->query('search');
                $query->where(function($q) use ($search) {
                    $q->where('name', 'LIKE', "%{$search}%")
                      ->orWhere('email', 'LIKE', "%{$search}%");
                });
            }

            $users = $query->paginate($perPage, ['*'], 'page', $page);

            // Dodajemo statistike za svakog korisnika
            $users->getCollection()->transform(function ($user) {
                $totalBalance = $user->accounts->sum('balance');
                $totalTransactions = $user->accounts->sum(function ($account) {
                    return $account->transactions->count();
                });

                // Izračunavamo mesečne statistike
                $currentMonth = now()->format('Y-m');
                $monthlyTransactions = Transaction::whereHas('account', function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                })->whereRaw("DATE_FORMAT(transaction_date, '%Y-%m') = ?", [$currentMonth])
                  ->with('category')
                  ->get();

                $monthlyIncome = $monthlyTransactions->where('category.type', 'income')->sum('amount');
                $monthlyExpense = $monthlyTransactions->where('category.type', 'expense')->sum('amount');

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'created_at' => $user->created_at,
                    'statistics' => [
                        'total_accounts' => $user->accounts->count(),
                        'total_categories' => $user->categories->count(),
                        'total_balance' => $totalBalance,
                        'total_transactions' => $totalTransactions,
                        'monthly_income' => $monthlyIncome,
                        'monthly_expense' => $monthlyExpense,
                        'monthly_net' => $monthlyIncome - $monthlyExpense,
                    ]
                ];
            });

            return response()->json($users);

        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Failed to fetch users',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Prikazuje pojedinačnog korisnika sa detaljnim statistikama
     */
    public function show(User $user)
    {
        try {
            $user->load(['accounts.transactions.category', 'categories']);
            
            // Detaljne statistike
            $totalBalance = $user->accounts->sum('balance');
            $allTransactions = $user->accounts->flatMap->transactions;
            
            // Grupisanje po mesecima (poslednih 6 meseci)
            $monthlyStats = [];
            for ($i = 5; $i >= 0; $i--) {
                $month = now()->subMonths($i)->format('Y-m');
                $monthName = now()->subMonths($i)->format('M Y');
                
                $monthTransactions = $allTransactions->filter(function ($transaction) use ($month) {
                    return $transaction->transaction_date && 
                           date('Y-m', strtotime($transaction->transaction_date)) === $month;
                });
                
                $income = $monthTransactions->where('category.type', 'income')->sum('amount');
                $expense = $monthTransactions->where('category.type', 'expense')->sum('amount');
                
                $monthlyStats[] = [
                    'month' => $monthName,
                    'income' => $income,
                    'expense' => $expense,
                    'net' => $income - $expense
                ];
            }

            // Kategorijske statistike
            $categoryStats = $user->categories->map(function ($category) use ($allTransactions) {
                $categoryTransactions = $allTransactions->where('category_id', $category->id);
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'type' => $category->type,
                    'transaction_count' => $categoryTransactions->count(),
                    'total_amount' => $categoryTransactions->sum('amount')
                ];
            });

            $userData = [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'created_at' => $user->created_at,
                'accounts' => $user->accounts,
                'categories' => $user->categories,
                'statistics' => [
                    'total_accounts' => $user->accounts->count(),
                    'total_categories' => $user->categories->count(),
                    'total_balance' => $totalBalance,
                    'total_transactions' => $allTransactions->count(),
                    'monthly_breakdown' => $monthlyStats,
                    'category_breakdown' => $categoryStats
                ]
            ];

            return response()->json($userData);

        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Failed to fetch user details',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Kreiranje novog korisnika (samo admin)
     */
    public function store(Request $request)
    {
        try {
            $data = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'password' => 'required|string|min:8',
                'role' => 'required|string|in:user,admin,guest',
            ]);

            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'role' => $data['role'],
            ]);

            return response()->json([
                'message' => 'User created successfully',
                'user' => $user
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);

        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Failed to create user',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Ažuriranje korisnika
     */
    public function update(Request $request, User $user)
    {
        try {
            $data = $request->validate([
                'name' => 'sometimes|required|string|max:255',
                'email' => 'sometimes|required|email|unique:users,email,' . $user->id,
                'password' => 'sometimes|nullable|string|min:8',
                'role' => 'sometimes|required|string|in:user,admin,guest',
            ]);

            // Hashuj password ako je prosleđen
            if (isset($data['password'])) {
                $data['password'] = Hash::make($data['password']);
            }

            $user->update($data);

            return response()->json([
                'message' => 'User updated successfully',
                'user' => $user
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);

        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Failed to update user',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Brisanje korisnika (cascade delete accounts i transactions)
     */
    public function destroy(User $user)
    {
        try {
            // Laravel će automatski obrisati povezane accounts i transactions
            // zbog onDelete('cascade') u migracijama
            $user->delete();

            return response()->json([
                'message' => 'User deleted successfully'
            ], 200);

        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Failed to delete user',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Brza statistika za admin dashboard
     */
    public function systemStats()
{
    try {
        $stats = [
            'total_users' => User::count(),
            'total_admins' => User::where('role', 'admin')->count(),
            'total_accounts' => Account::count(),
            'total_transactions' => Transaction::count(),
            'total_system_balance' => (float) Account::sum('balance'), // Cast to float
            'users_by_role' => User::groupBy('role')->selectRaw('role, count(*) as count')->get(),
            'recent_users' => User::orderBy('created_at', 'desc')->limit(5)->get(['id', 'name', 'email', 'role', 'created_at']),
        ];

        return response()->json($stats);

    } catch (\Throwable $e) {
        return response()->json([
            'message' => 'Failed to fetch system statistics',
            'error' => $e->getMessage(),
        ], 500);
    }
}
}