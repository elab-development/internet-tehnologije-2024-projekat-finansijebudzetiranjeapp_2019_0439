<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AccountController;
use App\Http\Controllers\API\CategoryController;
use App\Http\Controllers\API\TransactionController;
use App\Http\Controllers\API\AuthController;

Route::prefix('api')->group(function () {

     Route::post('register', [AuthController::class,'register'])
         ->name('api.register');
    Route::post('login',    [AuthController::class,'login'])
         ->name('api.login');
    Route::post('logout',   [AuthController::class,'logout'])
         ->middleware('auth:sanctum')
         ->name('api.logout');
 Route::post('password/forgot', [AuthController::class,'forgotPassword'])
     ->name('password.forgot');
Route::post('password/reset',  [AuthController::class,'resetPassword'])
     ->name('password.reset');
     
    // 1) Resource rute
    Route::apiResource('accounts',    AccountController::class);
    Route::apiResource('categories',  CategoryController::class);


    // 2) Ruta sa više HTTP metoda za pretragu transakcija
    Route::match(['get','post'], 'transactions/search', [TransactionController::class,'search'])
         ->name('transactions.search');

    Route::apiResource('transactions', TransactionController::class);

         // 3) Dinamička i imenovana ruta za transakcije jednog računa
    Route::get('accounts/{account}/transactions', [AccountController::class,'transactions'])
         ->name('accounts.transactions');

    // 4) Fallback ruta za sve neuhvaćene /api URI-je
    Route::fallback(function () {
        return response()->json(['message' => 'Not Found'], 404);
    });