<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AccountController;
use App\Http\Controllers\API\CategoryController;
use App\Http\Controllers\API\TransactionController;
use App\Http\Controllers\API\AuthController;

Route::prefix('api')->group(function () {
    // 1) Resource rute za accounts i categories (ostaju na mestu)
    Route::apiResource('accounts',   AccountController::class);
    Route::apiResource('categories', CategoryController::class);
     Route::post('register', [AuthController::class,'register'])
         ->name('api.register');
    Route::post('login',    [AuthController::class,'login'])
         ->name('api.login');
    Route::post('logout',   [AuthController::class,'logout'])
         ->middleware('auth:sanctum')
         ->name('api.logout');

    // 2) RUTA ZA PRETRAGU — mora ovde, pre resource('transactions')
    Route::match(['get','post'], 'transactions/search', [TransactionController::class,'search'])
         ->name('transactions.search');

    // 3) Resource rute za transactions
    Route::apiResource('transactions', TransactionController::class);

    // 4) Dinamička ruta za transakcije po računu
    Route::get('accounts/{account}/transactions', [AccountController::class,'transactions'])
         ->name('accounts.transactions');

    // 5) Fallback
    Route::fallback(fn() => response()->json(['message'=>'Not Found'],404));
});