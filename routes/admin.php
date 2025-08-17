<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\Admin\AdminVendorController;

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
| All routes for admin functionality
*/

Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    // Dashboard
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
    
    // ✅ NEW: Comprehensive User Management
    Route::get('/users', [UserManagementController::class, 'index'])->name('users.index');
    Route::post('/users/toggle-activation', [UserManagementController::class, 'toggleActivation'])->name('users.toggle-activation');
    Route::get('/users/{type}/{id}', [UserManagementController::class, 'show'])->name('users.show');
    
    // ✅ NEW: Detailed Management Views with Pagination
    Route::get('/manage-customers', [UserManagementController::class, 'manageCustomers'])->name('users.manage-customers');
    Route::get('/manage-riders', [UserManagementController::class, 'manageRiders'])->name('users.manage-riders');
    Route::get('/manage-vendors', [UserManagementController::class, 'manageVendors'])->name('users.manage-vendors');
    
    // ✅ NEW: Vendor Store Management
    Route::get('/vendor-stores', [AdminVendorController::class, 'index'])->name('vendor-stores.index');
    Route::get('/vendor-stores/{vendorStore}', [AdminVendorController::class, 'show'])->name('vendor-stores.show');
    Route::post('/vendor-stores/{vendorStore}/toggle-status', [AdminVendorController::class, 'toggleStatus'])->name('vendor-stores.toggle-status');
    Route::get('/vendor-stores/{vendorStore}/appointments', [AdminVendorController::class, 'getAppointmentHistory'])->name('vendor-stores.appointments');
    Route::get('/vendor-stores/{vendorStore}/orders', [AdminVendorController::class, 'getOrderHistory'])->name('vendor-stores.orders');
    
    // ✅ LEGACY: Keep old routes for backward compatibility
    Route::get('/users/{user}', [AdminDashboardController::class, 'showUser'])->name('users.legacy-show');
    Route::patch('/users/{user}/status', [AdminDashboardController::class, 'updateUserStatus'])->name('users.update-status');
    
    // Vendor Management
    Route::get('/vendors', [AdminDashboardController::class, 'vendors'])->name('vendors.index');
    Route::patch('/vendors/{vendor}/verify', [AdminDashboardController::class, 'verifyVendor'])->name('vendors.verify');
    
    // Rider Management
    Route::get('/riders', [AdminDashboardController::class, 'riders'])->name('riders.index');
    Route::patch('/riders/{rider}/approve', [AdminDashboardController::class, 'approveRider'])->name('riders.approve');
    
    // System Settings
    Route::get('/settings', [AdminDashboardController::class, 'settings'])->name('settings');
    Route::put('/settings', [AdminDashboardController::class, 'updateSettings'])->name('settings.update');
    
    // Reports & Analytics
    Route::get('/reports', [AdminDashboardController::class, 'reports'])->name('reports');
    Route::get('/analytics', [AdminDashboardController::class, 'analytics'])->name('analytics');
});