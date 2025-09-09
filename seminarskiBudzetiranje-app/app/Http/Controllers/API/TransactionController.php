<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    /**
     * Prikaz svih transakcija.
     */
    public function index()
    {
        return response()->json(Transaction::all());
    }

    /**
     * Kreiranje nove transakcije.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'account_id'      => 'required|exists:accounts,id',
            'category_id'     => 'required|exists:categories,id',
            'amount'          => 'required|numeric',
            'transaction_date'=> 'required|date',
            //'description'     => 'nullable|string',
        ]);

        $transaction = Transaction::create($data);

        return response()->json($transaction, 201);
    }

    /**
     * Prikaz jedne transakcije.
     */
    public function show(Transaction $transaction)
    {
        return response()->json($transaction);
    }

    /**
     * Ažuriranje postojeće transakcije.
     */
    public function update(Request $request, Transaction $transaction)
    {
        $data = $request->validate([
            'amount'          => 'sometimes|required|numeric',
            'transaction_date'=> 'sometimes|required|date',
            //'description'     => 'nullable|string',
        ]);

        $transaction->update($data);

        return response()->json($transaction);
    }

    /**
     * Brisanje transakcije.
     */
    public function destroy(Transaction $transaction)
    {
        $transaction->delete();
        return response()->json(null, 204);
    }
}