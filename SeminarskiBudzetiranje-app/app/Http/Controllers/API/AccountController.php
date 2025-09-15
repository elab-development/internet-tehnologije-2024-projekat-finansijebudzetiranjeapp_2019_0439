<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Account;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AccountController extends \Illuminate\Routing\Controller
{
    public function __construct()
    {
        // STORE / UPDATE / DESTROY zahtevaju autentifikaciju
        $this->middleware('auth:sanctum')->only(['store', 'update', 'destroy']);
    }
    
    public function index(Request $request)
    {
        try {
            // Pagination params
            $perPage = $request->query('per_page', 15);
            $page    = $request->query('page', 1);

            $query = Account::query();

            // Ako je admin, može da vidi sve račune
            // Ako nije admin, vidi samo svoje račune
            $user = $request->user();
            if ($user && $user->role !== 'admin') {
                $query->where('user_id', $user->id);
            } elseif ($request->has('user_id')) {
                // Admin može da filtrira po određenom korisniku
                $query->where('user_id', $request->query('user_id'));
            }

            // Execute paginated query
            $accounts = $query->paginate($perPage, ['*'], 'page', $page);

            return response()->json($accounts);

        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Failed to fetch accounts',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $user = $request->user();
            
            $data = $request->validate([
                'user_id' => 'nullable|exists:users,id', // Admin može da specificira user_id
                'name'    => 'required|string|max:255',
                'balance' => 'nullable|numeric',
            ]);

            // Ako nije admin, može da kreira račune samo za sebe
            if ($user->role !== 'admin') {
                $data['user_id'] = $user->id;
            } elseif (!isset($data['user_id'])) {
                // Ako admin ne specificira user_id, koristi svoj
                $data['user_id'] = $user->id;
            }

            $account = Account::create($data);
            return response()->json($account, 201);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors'  => $e->errors(),
            ], 422);

        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Failed to create account',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    public function show(Request $request, Account $account)
    {
        try {
            $user = $request->user();
            
            // Proverava da li korisnik ima dozvolu da vidi ovaj račun
            if ($user && $user->role !== 'admin' && $account->user_id !== $user->id) {
    return response()->json([
        'message' => 'Unauthorized to view this account'
    ], 403);
}
            
            return response()->json($account);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Failed to fetch account',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    public function update(Request $request, Account $account)
    {
        try {
            $user = $request->user();
            
            // Proverava da li korisnik ima dozvolu da ažurira ovaj račun
            if ($user->role !== 'admin' && $account->user_id !== $user->id) {
                return response()->json([
                    'message' => 'Unauthorized to update this account'
                ], 403);
            }
            
            $data = $request->validate([
                'name'    => 'sometimes|required|string|max:255',
                'balance' => 'sometimes|numeric',
            ]);

            $account->update($data);
            return response()->json($account);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors'  => $e->errors(),
            ], 422);

        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Failed to update account',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    public function destroy(Request $request, Account $account)
    {
        try {
            $user = $request->user();
            
            // Proverava da li korisnik ima dozvolu da obriše ovaj račun
            if ($user->role !== 'admin' && $account->user_id !== $user->id) {
                return response()->json([
                    'message' => 'Unauthorized to delete this account'
                ], 403);
            }
            
            $account->delete();
            return response()->json(null, 204);

        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Failed to delete account',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }
    
    /**
     * Dinamička ruta: sve transakcije za dati račun
     */
    public function transactions(Request $request, Account $account)
    {
        try {
            $user = $request->user();
            
            // Proverava da li korisnik ima dozvolu da vidi transakcije ovog računa
            if ($user && $user->role !== 'admin' && $account->user_id !== $user->id) {
                return response()->json([
                    'message' => 'Unauthorized to view transactions for this account'
                ], 403);
            }
            
            $transactions = $account->transactions; // relacija iz modela
            return response()->json($transactions);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Failed to fetch transactions for account',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }
}