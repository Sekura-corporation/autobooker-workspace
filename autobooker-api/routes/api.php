<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

use App\Http\Controllers\Api\AuthController;
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

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/register-store-owner', [AuthController::class, 'registerStoreOwner']);
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::middleware('auth:sanctum')->get('/loyalty', [LoyaltyController::class, 'index']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});

Route::middleware('auth:sanctum')->group(function () {
    Route::middleware('role:store_owner')->group(function () {
        Route::get('/store/dashboard', [StoreDashboardController::class, 'index']);
        Route::post('/store/expenses', [StoreExpenseController::class, 'store']);
        Route::get('/store/profile', [StoreProfileController::class, 'show']);
        Route::put('/store/profile', [StoreProfileController::class, 'update']);

        Route::get('/store/services', [StoreServiceController::class, 'index']);
        Route::post('/store/services', [StoreServiceController::class, 'store']);
        Route::put('/store/services/{service}', [StoreServiceController::class, 'update']);
        Route::delete('/store/services/{service}', [StoreServiceController::class, 'destroy']);

        Route::get('/store/appointments', [StoreAppointmentController::class, 'index']);
        Route::patch('/store/appointments/{appointment}/status', [StoreAppointmentController::class, 'updateStatus']);
        Route::get('/store/appointments/{appointment}', [StoreAppointmentController::class, 'show']);
    });

    // Stores
    Route::get('/stores', [StoreController::class, 'index']);
    Route::get('/stores/{store}', [StoreController::class, 'show']);
    Route::get('/stores/{store}/services', [StoreController::class, 'services']);
    Route::get('/stores/{store}/booked-times', [StoreController::class, 'bookedTimes']);    
    

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

