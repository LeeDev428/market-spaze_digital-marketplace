<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Customer\CustomerDashboardController;
use App\Http\Controllers\AppointmentController;

/*
|--------------------------------------------------------------------------
| Customer Routes
|--------------------------------------------------------------------------
| All routes for customer functionality
*/

Route::middleware(['auth', 'customer'])->name('customer.')->group(function () {
    // Dashboard
    Route::get('/dashboard', [CustomerDashboardController::class, 'index'])->name('dashboard');
    
    // Profile & Settings
    Route::get('/profile', [CustomerDashboardController::class, 'profile'])->name('profile');
    Route::put('/profile', [CustomerDashboardController::class, 'updateProfile'])->name('profile.update');
    Route::get('/settings', [CustomerDashboardController::class, 'settings'])->name('settings');
    Route::put('/settings', [CustomerDashboardController::class, 'updateSettings'])->name('settings.update');
    
    // Appointments
    Route::get('/my-appointments', [AppointmentController::class, 'myAppointments'])->name('appointments.my');
    Route::get('/appointments/history', [AppointmentController::class, 'history'])->name('appointments.history');
    Route::get('/history', [AppointmentController::class, 'customerHistory'])->name('history');
    Route::post('/appointments/{appointment}/cancel', [AppointmentController::class, 'cancel'])->name('appointments.cancel');
    Route::post('/appointments/{appointment}/reschedule', [AppointmentController::class, 'reschedule'])->name('appointments.reschedule');
    Route::post('/appointments/{appointment}/review', [AppointmentController::class, 'review'])->name('appointments.review');
    
    // Orders & Shopping
    Route::get('/orders', [CustomerDashboardController::class, 'orders'])->name('orders.index');
    Route::get('/orders/{order}', [CustomerDashboardController::class, 'showOrder'])->name('orders.show');
    Route::post('/orders/{order}/cancel', [CustomerDashboardController::class, 'cancelOrder'])->name('orders.cancel');
    
    // Favorites & Wishlist
    Route::get('/favorites', [CustomerDashboardController::class, 'favorites'])->name('favorites');
    Route::post('/favorites/{vendor}', [CustomerDashboardController::class, 'addFavorite'])->name('favorites.add');
    Route::delete('/favorites/{vendor}', [CustomerDashboardController::class, 'removeFavorite'])->name('favorites.remove');
    
    // Reviews & Ratings
    Route::get('/reviews', [CustomerDashboardController::class, 'reviews'])->name('reviews');
    Route::post('/reviews', [CustomerDashboardController::class, 'storeReview'])->name('reviews.store');
    Route::put('/reviews/{review}', [CustomerDashboardController::class, 'updateReview'])->name('reviews.update');
    
    // Notifications
    Route::get('/notifications', [CustomerDashboardController::class, 'notifications'])->name('notifications');
    Route::patch('/notifications/{notification}/read', [CustomerDashboardController::class, 'markNotificationAsRead'])->name('notifications.read');
    
    // Support
    Route::get('/support', [CustomerDashboardController::class, 'support'])->name('support');
    Route::post('/support/ticket', [CustomerDashboardController::class, 'createTicket'])->name('support.ticket');
});