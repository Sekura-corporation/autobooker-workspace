<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProfileAvatarController;
use App\Http\Controllers\Api\StoreController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\StoreServiceController;
use App\Http\Controllers\Api\VehicleController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\StoreAppointmentController;
use App\Http\Controllers\Api\LoyaltyController;
use App\Http\Controllers\Api\StoreDashboardController;
use App\Http\Controllers\Api\StoreExpenseController;
use App\Http\Controllers\Api\StoreProfileController;
use App\Http\Controllers\Api\StoreCustomerController;
use App\Http\Controllers\Api\StoreLoyaltyController;
use App\Http\Controllers\Api\StoreReportController;
use App\Http\Controllers\Api\StoreStockController;
use App\Http\Controllers\Api\StorePackageController;
use App\Http\Controllers\Api\ProductOrderController;


Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/register-store-owner', [AuthController::class, 'registerStoreOwner']);
    Route::post('/login', [AuthController::class, 'login']);

    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/verify-code', [AuthController::class, 'verifyCode']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::post('/avatar', [ProfileAvatarController::class, 'store']);
        Route::delete('/avatar', [ProfileAvatarController::class, 'destroy']);
    });
});

Route::middleware('auth:sanctum')->group(function () {
    Route::middleware('role:store_owner')->group(function () {
        Route::get('/store/dashboard', [StoreDashboardController::class, 'index']);
        Route::post('/store/expenses', [StoreExpenseController::class, 'store']);
        Route::get('/store/profile', [StoreProfileController::class, 'show']);
        Route::put('/store/profile', [StoreProfileController::class, 'update']);
        Route::post('/store/profile/upload', [StoreProfileController::class, 'uploadImages']);

        Route::get('/store/services', [StoreServiceController::class, 'index']);
        Route::post('/store/services', [StoreServiceController::class, 'store']);
        Route::put('/store/services/{service}', [StoreServiceController::class, 'update']);
        Route::delete('/store/services/{service}', [StoreServiceController::class, 'destroy']);

        Route::get('/store/appointments', [StoreAppointmentController::class, 'index']);
        Route::patch('/store/appointments/{appointment}/status', [StoreAppointmentController::class, 'updateStatus']);
        Route::get('/store/appointments/{appointment}', [StoreAppointmentController::class, 'show']);
        Route::post('/store/appointments/manual', [StoreAppointmentController::class, 'storeManual']);
        Route::get('/store/customers/by-phone', [StoreAppointmentController::class, 'findCustomerByPhone']);
        
        Route::get('/store/customers', [StoreCustomerController::class, 'index']);
        Route::get('/store/customers/{client}', [StoreCustomerController::class, 'show']);
        Route::post('/store/customers', [StoreCustomerController::class, 'store']);

        Route::get('/store/loyalty', [StoreLoyaltyController::class, 'index']);
        Route::post('/store/loyalty/rewards', [StoreLoyaltyController::class, 'storeReward']);
        Route::put('/store/loyalty/rewards/{reward}', [StoreLoyaltyController::class, 'updateReward']);
        Route::patch('/store/loyalty/rewards/{reward}/toggle', [StoreLoyaltyController::class, 'toggleReward']);
        Route::put('/store/loyalty/rule', [StoreLoyaltyController::class, 'updateRule']);

        Route::get('/store/reports', [StoreReportController::class, 'index']);

        Route::get('/store/stock', [StoreStockController::class, 'index']);
        Route::post('/store/stock/items', [StoreStockController::class, 'storeItem']);
        Route::post('/store/stock/items/{item}/movement', [StoreStockController::class, 'movement']);
        Route::get('/store/stock/history', [StoreStockController::class, 'history']);
        Route::delete('/store/stock/items/{item}', [StoreStockController::class, 'destroy']);

        Route::get('/store/packages', [StorePackageController::class, 'index']);
        Route::post('/store/packages', [StorePackageController::class, 'store']);
        Route::put('/store/packages/{package}', [StorePackageController::class, 'update']);
        Route::delete('/store/packages/{package}', [StorePackageController::class, 'destroy']);
    });

    Route::middleware('auth:sanctum')->get('/loyalty', [LoyaltyController::class, 'index']);
    Route::middleware('auth:sanctum')->post('/loyalty/redeem', [LoyaltyController::class, 'redeem']);

    // Stores
    Route::get('/stores', [StoreController::class, 'index']);
    Route::get('/stores/{store}/products', [StoreController::class, 'products']);
    Route::get('/stores/{store}/packages', [StoreController::class, 'packages']);
    Route::get('/stores/{store}', [StoreController::class, 'show']);
    Route::get('/stores/{store}/services', [StoreController::class, 'services']);
    Route::get('/stores/{store}/booked-times', [StoreController::class, 'bookedTimes']);
    Route::get('/stores/{store}/rewards', [StoreController::class, 'rewards']);
    Route::get('/stores/{storeId}/loyalty', [StoreLoyaltyController::class, 'publicShow']);
    
    
    

    // Services
    Route::get('/services', [ServiceController::class, 'index']);
    Route::get('/services/{service}', [ServiceController::class, 'show']);

    // Vehicles
    Route::get('/vehicles', [VehicleController::class, 'index']);
    Route::post('/vehicles', [VehicleController::class, 'store']);
    Route::put('/vehicles/{vehicle}', [VehicleController::class, 'update']);
    Route::delete('/vehicles/{vehicle}', [VehicleController::class, 'destroy']);

    // Customers
    Route::get('/customers', [CustomerController::class, 'index']);
    Route::post('/customers', [CustomerController::class, 'store']);

    // Appointments
    Route::get('/appointments', [AppointmentController::class, 'index']);
    Route::post('/appointments', [AppointmentController::class, 'store']);
    Route::put('/appointments/{appointment}', [AppointmentController::class, 'update']);

    // Product Orders
    Route::post('/store/product-orders', [ProductOrderController::class, 'store']);
    Route::get('/product-orders', [ProductOrderController::class, 'index']);

    Route::put('/auth/profile', function (Request $request) {
        $user = $request->user();
    
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
        ]);
    
        $user->update($validated);
    
        return response()->json($user);
    });

    Route::delete('/auth/profile', function (Request $request) {
        $user = $request->user();
    
        // apaga tokens do Sanctum
        $user->tokens()->delete();
    
        // apaga o usuário
        $user->delete();
    
        return response()->json([
            'message' => 'Conta deletada com sucesso.'
        ]);
    });
});

