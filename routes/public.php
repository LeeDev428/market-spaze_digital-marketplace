<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\AppointmentController;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
| Routes accessible without authentication
*/

// Homepage
Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

// Public Appointment Routes
Route::prefix('appointments')->name('appointments.')->group(function () {
    Route::get('/', [AppointmentController::class, 'index'])->name('index');
    Route::post('/', [AppointmentController::class, 'store'])->name('store');
    Route::get('/available-slots', [AppointmentController::class, 'getAvailableSlots'])->name('available-slots');
    Route::get('/{appointment}/success', [AppointmentController::class, 'success'])->name('success');
});

// Public Vendor/Store Browse
Route::get('/browse', function () {
    return Inertia::render('browse/Index');
})->name('browse');

Route::get('/vendors', function () {
    return Inertia::render('vendors/Index');
})->name('vendors.index');

Route::get('/vendors/{vendor}', function () {
    return Inertia::render('vendors/Show');
})->name('vendors.show');

// Public Service Categories
Route::get('/services', function () {
    return Inertia::render('services/Index');
})->name('services.index');

Route::get('/services/{category}', function () {
    return Inertia::render('services/Category');
})->name('services.category');

// About & Contact
Route::get('/about', function () {
    return Inertia::render('about');
})->name('about');

Route::get('/contact', function () {
    return Inertia::render('contact');
})->name('contact');

Route::post('/contact', function () {
    // Handle contact form submission
})->name('contact.submit');

// Terms & Privacy
Route::get('/terms', function () {
    return Inertia::render('legal/terms');
})->name('terms');

Route::get('/privacy', function () {
    return Inertia::render('legal/privacy');
})->name('privacy');