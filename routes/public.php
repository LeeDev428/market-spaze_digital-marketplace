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

// Service Details
Route::get('/service-details/{id}', function ($id) {
    // Mock service data - replace with actual database query
    $service = [
        'id' => (int)$id,
        'name' => 'Professional Electronics Repair',
        'description' => 'Complete electronics repair service including smartphones, laptops, tablets, and gaming consoles. Our certified technicians use original parts and provide warranty on all repairs.',
        'category' => 'Electronics & Technology',
        'price_min' => 500,
        'price_max' => 2000,
        'duration_minutes' => 120,
        'discount_percentage' => 15,
        'popular' => true,
        'includes' => [
            'Free diagnostic assessment',
            'Original parts replacement',
            '90-day warranty',
            'Pick-up and delivery service',
            'Data recovery assistance'
        ],
        'requirements' => [
            'Device must be accessible',
            'Provide purchase receipt if available',
            'Backup important data before service'
        ],
        'images' => [
            '/img/electronics-repair-1.jpg',
            '/img/electronics-repair-2.jpg',
            '/img/electronics-repair-3.jpg'
        ]
    ];

    $vendor = [
        'id' => 1,
        'business_name' => 'TechFix Pro',
        'description' => 'Professional electronics repair and maintenance services with over 10 years of experience',
        'address' => '123 Tech Street, Digital City, Metro Manila',
        'contact_phone' => '+63 912 345 6789',
        'contact_email' => 'contact@techfixpro.com',
        'rating' => 4.8,
        'total_reviews' => 156,
        'verified' => true,
        'response_time' => 'Within 2 hours'
    ];

    return Inertia::render('servicedetails', [
        'service' => $service,
        'vendor' => $vendor
    ]);
})->name('service-details.show');

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