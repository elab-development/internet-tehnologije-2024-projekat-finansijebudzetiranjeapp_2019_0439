<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AccountController;
use App\Http\Controllers\API\CategoryController;
use App\Http\Controllers\API\TransactionController;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\UploadController;
use App\Http\Controllers\API\UserController;
use App\Http\Controllers\API\AnalyticsController; // DODAJ OVO

Route::prefix('api')->group(function () {

    Route::post('register', [AuthController::class, 'register'])
        ->name('api.register');
    Route::post('login', [AuthController::class, 'login'])
        ->name('api.login');
    Route::post('logout', [AuthController::class, 'logout'])
        ->middleware('auth:sanctum')
        ->name('api.logout');

    Route::post('password/forgot', [AuthController::class, 'forgotPassword'])
        ->name('password.forgot');
    Route::post('password/reset', [AuthController::class, 'resetPassword'])
        ->name('password.reset');

    // Public guest route
    Route::get('guest/info', function () {
        return response()->json(['message' => 'Hello Guest']);
    });

    // Protected routes that require authentication
    Route::middleware(['auth:sanctum'])->group(function () {
        
        // Resource routes - accessible to authenticated users
        Route::apiResource('accounts', AccountController::class);
        Route::apiResource('categories', CategoryController::class);
        Route::apiResource('transactions', TransactionController::class);

        // Transaction search route
        Route::match(['get', 'post'], 'transactions/search', [TransactionController::class, 'search'])
            ->name('transactions.search');

        // Account transactions route
        Route::get('accounts/{account}/transactions', [AccountController::class, 'transactions'])
            ->name('accounts.transactions');

        // File upload
        Route::post('upload', [UploadController::class, 'storeSimple']);

        // User dashboard (accessible to all authenticated users)
        Route::get('user/dashboard', function () {
            return response()->json(['message' => 'Welcome User']);
        });

        // ANALYTICS RUTE - DODAJ OVO:
        Route::prefix('analytics')->name('analytics.')->group(function () {
            Route::get('financial-overview', [AnalyticsController::class, 'getFinancialOverview'])
                ->name('financial-overview');
            
            Route::get('monthly-trends', [AnalyticsController::class, 'getMonthlyTrends'])
                ->name('monthly-trends');
            
            Route::get('user-summary-procedure', [AnalyticsController::class, 'getUserSummaryProcedure'])
                ->name('user-summary-procedure');
            
            Route::post('batch-transaction-update', [AnalyticsController::class, 'batchTransactionUpdate'])
                ->name('batch-transaction-update');
            
            Route::get('category-analysis', [AnalyticsController::class, 'getCategoryAnalysis'])
                ->name('category-analysis');
            
            Route::get('audit-log', [AnalyticsController::class, 'getAuditLog'])
                ->name('audit-log');
        });
    });

    // Admin-only routes
    Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
        Route::get('admin/dashboard', function () {
            return response()->json(['message' => 'Welcome Admin']);
        });
        
        // User management routes
        Route::apiResource('users', UserController::class);
        Route::get('admin/system-stats', [UserController::class, 'systemStats'])
            ->name('admin.system-stats');
    });

    // Fallback route for unmatched API routes
    Route::fallback(function () {
        return response()->json(['message' => 'API endpoint not found'], 404);
    });
});

// SPA fallback route for React - must be at the very end
Route::get('/{any}', function () {
    return view('welcome');
})->where('any', '.*');