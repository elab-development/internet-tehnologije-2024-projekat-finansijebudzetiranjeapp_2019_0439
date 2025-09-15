<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\Account;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class TransactionController extends \Illuminate\Routing\Controller
{
    public function __construct()
    {
        // STORE / UPDATE / DESTROY zahtevaju autentifikaciju
        $this->middleware('auth:sanctum')->only(['store', 'update', 'destroy']);
    }
    
    public function index(Request $request)
    {
        try {
            $perPage = $request->query('per_page', 15);
            $page    = $request->query('page', 1);

            $query = Transaction::query()->with(['account', 'category']);

            $user = $request->user();
            
            // Ako nije admin, vidi samo svoje transakcije
            if ($user && $user->role !== 'admin') {
                $query->whereHas('account', function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                });
            }
            // Ako je admin i traži account_ids (za frontend filtriranje)
            elseif ($request->has('account_ids')) {
                $accountIds = explode(',', $request->query('account_ids'));
                $query->whereIn('account_id', $accountIds);
            }

            // Filtering examples:
            if ($request->has('min_amount')) {
                $query->where('amount', '>=', $request->query('min_amount'));
            }
            if ($request->has('max_amount')) {
                $query->where('amount', '<=', $request->query('max_amount'));
            }
            if ($request->has('date_from')) {
                $query->where('transaction_date', '>=', $request->query('date_from'));
            }
            if ($request->has('date_to')) {
                $query->where('transaction_date', '<=', $request->query('date_to'));
            }
            if ($request->has('account_id')) {
                $query->where('account_id', $request->query('account_id'));
            }
            if ($request->has('category_id')) {
                $query->where('category_id', $request->query('category_id'));
            }

            // Order by newest first
            $query->orderBy('transaction_date', 'desc')->orderBy('created_at', 'desc');

            $transactions = $query->paginate($perPage, ['*'], 'page', $page);

            return response()->json($transactions);

        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Failed to fetch transactions',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $user = $request->user();
            
            $data = $request->validate([
                'account_id'      => 'required|exists:accounts,id',
                'category_id'     => 'required|exists:categories,id',
                'amount'          => 'required|numeric',
                'transaction_date'=> 'required|date',
            ]);

            // Proverava da li korisnik pokušava da kreira transakciju za tuđi račun
            $account = Account::findOrFail($data['account_id']);
            if ($user->role !== 'admin' && $account->user_id !== $user->id) {
                return response()->json([
                    'message' => 'Unauthorized to create transaction for this account'
                ], 403);
            }

            $transaction = Transaction::create($data);
            
            // Load relationships for response
            $transaction->load(['account', 'category']);
            
            return response()->json($transaction, 201);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors'  => $e->errors(),
            ], 422);

        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Failed to create transaction',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    public function show(Request $request, Transaction $transaction)
    {
        try {
            $user = $request->user();
            
            // Proverava da li korisnik ima dozvolu da vidi ovu transakciju
            if ($user && $user->role !== 'admin' && $transaction->account->user_id !== $user->id) {
                return response()->json([
                    'message' => 'Unauthorized to view this transaction'
                ], 403);
            }
            
            $transaction->load(['account', 'category']);
            return response()->json($transaction);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Failed to fetch transaction',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    public function update(Request $request, Transaction $transaction)
    {
        try {
            $user = $request->user();
            
            // Proverava da li korisnik ima dozvolu da ažurira ovu transakciju
            if ($user->role !== 'admin' && $transaction->account->user_id !== $user->id) {
                return response()->json([
                    'message' => 'Unauthorized to update this transaction'
                ], 403);
            }
            
            $data = $request->validate([
                'amount'          => 'sometimes|required|numeric',
                'transaction_date'=> 'sometimes|required|date',
                'category_id'     => 'sometimes|required|exists:categories,id',
            ]);

            $transaction->update($data);
            $transaction->load(['account', 'category']);
            return response()->json($transaction);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors'  => $e->errors(),
            ], 422);

        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Failed to update transaction',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    public function destroy(Request $request, Transaction $transaction)
    {
        try {
            $user = $request->user();
            
            // Proverava da li korisnik ima dozvolu da obriše ovu transakciju
            if ($user->role !== 'admin' && $transaction->account->user_id !== $user->id) {
                return response()->json([
                    'message' => 'Unauthorized to delete this transaction'
                ], 403);
            }
            
            $transaction->delete();
            return response()->json(null, 204);

        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Failed to delete transaction',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }
    
    public function search(Request $request)
    {
        try {
            $user = $request->user();
            $q = $request->input('q');

            if (! is_numeric($q)) {
                return response()->json([
                    'message' => 'Query must be a number (amount).'
                ], 422);
            }

            $query = Transaction::where('amount', '>=', $q)->with(['account', 'category']);
            
            // Ako nije admin, traži samo svoje transakcije
            if ($user && $user->role !== 'admin') {
                $query->whereHas('account', function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                });
            }

            $results = $query->get();

            return response()->json($results);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Failed to search transactions',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }
}