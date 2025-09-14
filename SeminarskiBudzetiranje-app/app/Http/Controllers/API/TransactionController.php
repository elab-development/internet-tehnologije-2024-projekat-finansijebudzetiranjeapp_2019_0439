<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class TransactionController extends \Illuminate\Routing\Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum')->only(['store', 'update', 'destroy']);
    }

    public function index(Request $request)
    {
        try {
            $perPage = $request->query('per_page', 5); // default 5
            $page    = $request->query('page', 1);
            $query = Transaction::query()
                ->with('category') // eager load kategorije
                ->join('categories', 'transactions.category_id', '=', 'categories.id')
                ->select('transactions.*', 'categories.type as category_type');
            // Filtriranje po minimalnom iznosu
            if ($request->has('min_amount')) {
                $query->where('amount', '>=', $request->query('min_amount'));
            }

            // Filtriranje po maksimalnom iznosu
            if ($request->has('max_amount')) {
                $query->where('amount', '<=', $request->query('max_amount'));
            }
            // Filtriranje po tipu kategorije (income / expense)
            if ($request->has('category_type')) {
                $query->where('categories.type', $request->query('category_type'));
            }

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
            $data = $request->validate([
                'account_id'      => 'required|exists:accounts,id',
                'category_id'     => 'required|exists:categories,id',
                'amount'          => 'required|numeric',
                'transaction_date' => 'required|date',
            ]);

            // Automatski postavi type na osnovu kategorije
            $category = Category::find($data['category_id']);
            $data['type'] = $category->type;

            $transaction = Transaction::create($data);
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

    public function show(Transaction $transaction)
    {
        try {
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
            $data = $request->validate([
                'amount'          => 'sometimes|required|numeric',
                'transaction_date' => 'sometimes|required|date',
                'type'            => 'sometimes|in:income,expense'
            ]);

            $transaction->update($data);
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

    public function destroy(Transaction $transaction)
    {
        try {
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
            $q = $request->input('q');
            if (!is_numeric($q)) {
                return response()->json([
                    'message' => 'Query must be a number (amount).'
                ], 422);
            }
            $results = Transaction::where('amount', '>=', $q)->get();
            return response()->json($results);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Failed to search transactions',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }
}
