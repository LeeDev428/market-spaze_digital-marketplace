<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Rider\RiderDashboardController;
use App\Http\Controllers\Rider\RiderDeliveryController;
use App\Http\Controllers\Rider\RiderEarningsController;
use App\Http\Controllers\Rider\RiderProfileController;
use App\Http\Controllers\Rider\RiderNotificationController;

/*
|--------------------------------------------------------------------------
| Rider Routes
|--------------------------------------------------------------------------
| All routes for rider/delivery functionality
*/

Route::middleware(['auth', 'verified'])->prefix('rider')->name('rider.')->group(function () {
    // Dashboard
    Route::get('/dashboard', [RiderDashboardController::class, 'index'])->name('dashboard');
    
    // Profile & Settings
    Route::get('/profile', [RiderProfileController::class, 'show'])->name('profile');
    Route::put('/profile', [RiderProfileController::class, 'update'])->name('profile.update');
    Route::get('/settings', [RiderProfileController::class, 'settings'])->name('settings');
    Route::put('/settings', [RiderProfileController::class, 'updateSettings'])->name('settings.update');
    
    // Online/Offline Status & Location
    Route::post('/toggle-status', [RiderDashboardController::class, 'toggleOnlineStatus'])->name('toggle-status');
    Route::post('/update-location', [RiderDashboardController::class, 'updateLocation'])->name('update-location');
    
    // Delivery/Appointment Management
    Route::get('/deliveries/active', [RiderDeliveryController::class, 'active'])->name('deliveries.active');
    Route::get('/deliveries/calendar', [RiderDeliveryController::class, 'calendar'])->name('deliveries.calendar');
    Route::get('/deliveries/all', [RiderDeliveryController::class, 'all'])->name('deliveries.all');
    Route::get('/deliveries/history', [RiderDeliveryController::class, 'history'])->name('deliveries.history');
    Route::get('/deliveries/{appointment}', [RiderDeliveryController::class, 'show'])->name('deliveries.show');
    Route::get('/deliveries/{appointment}/details', [RiderDeliveryController::class, 'details'])->name('deliveries.details');
    Route::get('/deliveries/{appointment}/get', [RiderDeliveryController::class, 'getJob'])->name('deliveries.get');
    Route::post('/deliveries/{appointment}/accept', [RiderDeliveryController::class, 'accept'])->name('deliveries.accept');
    
    // Appointment Status Management
    Route::patch('/deliveries/{appointment}/status', [RiderDeliveryController::class, 'updateStatus'])->name('deliveries.update-status');
    Route::post('/deliveries/{appointment}/pickup', [RiderDeliveryController::class, 'pickup'])->name('deliveries.pickup');
    Route::post('/deliveries/{appointment}/complete', [RiderDeliveryController::class, 'complete'])->name('deliveries.complete');
    Route::post('/deliveries/{appointment}/cancel', [RiderDeliveryController::class, 'cancel'])->name('deliveries.cancel');
    
    // Earnings & Analytics
    Route::get('/earnings', [RiderEarningsController::class, 'index'])->name('earnings');
    Route::get('/earnings/daily', [RiderEarningsController::class, 'daily'])->name('earnings.daily');
    Route::get('/earnings/weekly', [RiderEarningsController::class, 'weekly'])->name('earnings.weekly');
    Route::get('/earnings/monthly', [RiderEarningsController::class, 'monthly'])->name('earnings.monthly');
    Route::get('/analytics', [RiderEarningsController::class, 'analytics'])->name('analytics');
    
    // Notifications
    Route::get('/notifications', [RiderNotificationController::class, 'index'])->name('notifications');
    Route::post('/notifications/{notification}/read', [RiderNotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/notifications/read-all', [RiderNotificationController::class, 'markAllAsRead'])->name('notifications.read-all');
});