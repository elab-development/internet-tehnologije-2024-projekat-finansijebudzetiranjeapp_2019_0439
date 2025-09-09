<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class TransactionController extends Controller
{
    public function index()
    {
        try {
            $transactions = Transaction::all();
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

            if (! is_numeric($q)) {
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
