<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * Prikaz svih kategorija.
     */
    public function index()
    {
        return response()->json(Category::all());
    }

    /**
     * Kreiranje nove kategorije.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'user_id' => 'required|exists:users,id',
            'name'    => 'required|string|max:255',
            'type'    => 'required|in:income,expense',
        ]);

        $category = Category::create($data);

        return response()->json($category, 201);
    }

    /**
     * Prikaz jedne kategorije.
     */
    public function show(Category $category)
    {
        return response()->json($category);
    }

    /**
     * Ažuriranje postojeće kategorije.
     */
    public function update(Request $request, Category $category)
    {
        $data = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'type' => 'sometimes|required|in:income,expense',
        ]);

        $category->update($data);

        return response()->json($category);
    }

    /**
     * Brisanje kategorije.
     */
    public function destroy(Category $category)
    {
        $category->delete();
        return response()->json(null, 204);
    }
}