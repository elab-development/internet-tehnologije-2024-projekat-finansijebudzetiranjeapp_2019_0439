<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Account;
use Illuminate\Http\Request;

class AccountController extends Controller
{
    public function index()
    {
        // Vraća sve račune u JSON-u
        return response()->json(Account::all());
    }

    public function store(Request $request)
    {
        // Validacija ulaza
        $data = $request->validate([
            'user_id' => 'required|exists:users,id',
            'name'    => 'required|string|max:255',
            'balance' => 'nullable|numeric',
        ]);

        $account = Account::create($data);

        return response()->json($account, 201);
    }

    public function show(Account $account)
    {
        return response()->json($account);
    }

    public function update(Request $request, Account $account)
    {
        $data = $request->validate([
            'name'    => 'sometimes|required|string|max:255',
            'balance' => 'sometimes|numeric',
        ]);

        $account->update($data);

        return response()->json($account);
    }

    public function destroy(Account $account)
    {
        $account->delete();
        return response()->json(null, 204);
    }
}