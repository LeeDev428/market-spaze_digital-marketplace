<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Vendor\VendorDashboardController;
use App\Http\Controllers\Vendor\VendorStoreController;
use App\Http\Controllers\Vendor\VendorAppointmentController;
use App\Http\Controllers\Vendor\VendorProductController;
use App\Http\Controllers\Vendor\VendorServiceController;


/*
|--------------------------------------------------------------------------
| Vendor Routes
|--------------------------------------------------------------------------
| All routes for vendor functionality
*/

Route::middleware(['auth', 'vendor'])->prefix('vendor')->name('vendor.')->group(function () {
    // Dashboard
    Route::get('/dashboard', [VendorDashboardController::class, 'index'])->name('dashboard');
    
    // Store Management (Both singular and plural routes for compatibility)
    Route::get('/store', [VendorStoreController::class, 'index'])->name('store.index');
    Route::get('/stores', [VendorStoreController::class, 'index'])->name('stores.index'); // Keep both
    Route::get('/store/create', [VendorStoreController::class, 'create'])->name('store.create');
    Route::post('/store', [VendorStoreController::class, 'store'])->name('store.store');
    Route::get('/store/{vendorStore}', [VendorStoreController::class, 'show'])->name('store.show');
    Route::get('/store/{vendorStore}/edit', [VendorStoreController::class, 'edit'])->name('store.edit');
    Route::put('/store/{vendorStore}', [VendorStoreController::class, 'update'])->name('store.update');
    Route::delete('/store/{vendorStore}', [VendorStoreController::class, 'destroy'])->name('store.destroy');
    
    // Appointment Management
    Route::get('/appointments', [VendorAppointmentController::class, 'index'])->name('appointments.index');
    Route::get('/appointments/monthly', [VendorAppointmentController::class, 'getMonthlyAppointments'])->name('appointments.monthly');
    Route::get('/appointments/daily', [VendorAppointmentController::class, 'getDayAppointments'])->name('appointments.daily');
    Route::post('/appointments/{appointment}/confirm', [VendorAppointmentController::class, 'confirm'])->name('appointments.confirm');
    Route::post('/appointments/{appointment}/cancel', [VendorAppointmentController::class, 'cancel'])->name('appointments.cancel');
    Route::post('/appointments/{appointment}/complete', [VendorAppointmentController::class, 'complete'])->name('appointments.complete');
    Route::patch('/appointments/{appointment}/status', [VendorAppointmentController::class, 'updateStatus'])->name('appointments.update-status');
    Route::get('/appointments/details', [VendorAppointmentController::class, 'details'])->name('appointments.details');

    // Products & Services
    // Route::resource('products', VendorProductController::class);
    // Route::resource('services', VendorServiceController::class);
    
    // Analytics & Reports
    Route::get('/analytics', [VendorDashboardController::class, 'analytics'])->name('analytics');
    Route::get('/reports', [VendorDashboardController::class, 'reports'])->name('reports');
    
    // Profile & Settings
    Route::get('/profile', [VendorDashboardController::class, 'profile'])->name('profile');
    Route::put('/profile', [VendorDashboardController::class, 'updateProfile'])->name('profile.update');
    Route::get('/settings', [VendorDashboardController::class, 'settings'])->name('settings');
    Route::put('/settings', [VendorDashboardController::class, 'updateSettings'])->name('settings.update');
});