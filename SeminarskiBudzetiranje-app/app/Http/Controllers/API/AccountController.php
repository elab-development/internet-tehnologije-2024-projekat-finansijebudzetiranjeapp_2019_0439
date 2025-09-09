<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Account;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AccountController extends Controller
{
    public function index()
    {
        try {
            $accounts = Account::all();
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
            $data = $request->validate([
                'user_id' => 'required|exists:users,id',
                'name'    => 'required|string|max:255',
                'balance' => 'nullable|numeric',
            ]);
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

    public function show(Account $account)
    {
        try {
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

    public function destroy(Account $account)
    {
        try {
            $account->delete();
            return response()->json(null, 204);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Failed to delete account',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }
}
