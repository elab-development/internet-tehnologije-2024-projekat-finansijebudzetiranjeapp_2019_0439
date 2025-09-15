<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;

class CategoryController extends \Illuminate\Routing\Controller
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

        $query = Category::query();

        // Filter by type (income|expense)
        if ($request->has('type')) {
            $query->where('type', $request->query('type'));
        }

        $categories = $query->paginate($perPage, ['*'], 'page', $page);

        return response()->json($categories);

    } catch (\Throwable $e) {
        return response()->json([
            'message' => 'Failed to fetch categories',
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
                'type'    => 'required|in:income,expense',
            ]);

            $category = Category::create($data);
            return response()->json($category, 201);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors'  => $e->errors(),
            ], 422);

        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Failed to create category',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    public function show(Category $category)
    {
        try {
            return response()->json($category);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Failed to fetch category',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    public function update(Request $request, Category $category)
    {
        try {
            $data = $request->validate([
                'name' => 'sometimes|required|string|max:255',
                'type' => 'sometimes|required|in:income,expense',
            ]);

            $category->update($data);
            return response()->json($category);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors'  => $e->errors(),
            ], 422);

        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Failed to update category',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    public function destroy(Category $category)
    {
        try {
            $category->delete();
            return response()->json(null, 204);

        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Failed to delete category',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }
}