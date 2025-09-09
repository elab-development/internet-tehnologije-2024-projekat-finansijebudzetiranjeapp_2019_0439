<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AccountController;
use App\Http\Controllers\API\CategoryController;
use App\Http\Controllers\API\TransactionController;
// REST API rute za sve tri resource
Route::prefix('api')->group(function () {
    Route::apiResource('accounts',    AccountController::class);
    Route::apiResource('categories',  CategoryController::class);
    Route::apiResource('transactions', TransactionController::class);
});
