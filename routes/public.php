<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\AppointmentController;
use App\Models\VendorProductService;
use App\Models\VendorStore;

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
    // Fetch service from database with vendor relationship
    $service = VendorProductService::with(['vendorStore', 'images'])
        ->where('id', $id)
        ->where('is_active', true)
        ->first();
    
    if (!$service) {
        abort(404, 'Service not found');
    }
    
    // Transform service data for frontend
    $serviceData = [
        'id' => $service->id,
        'name' => $service->name,
        'description' => $service->description,
        'category' => $service->category,
        'price_min' => $service->price_min,
        'price_max' => $service->price_max,
        'duration_minutes' => $service->duration_minutes,
        'discount_percentage' => $service->discount_percentage,
        'popular' => $service->is_popular,
        'includes' => $service->includes ?? [],
        'requirements' => $service->requirements ?? [],
        'rating' => $service->rating,
        'total_reviews' => $service->total_reviews,
        'has_warranty' => $service->has_warranty,
        'warranty_days' => $service->warranty_days,
        'pickup_available' => $service->pickup_available,
        'delivery_available' => $service->delivery_available,
        'emergency_service' => $service->emergency_service,
        'special_instructions' => $service->special_instructions,
        'tags' => $service->tags ?? [],
        'images' => $service->images ? $service->images->map(function($image) {
            return [
                'id' => $image->id,
                'url' => asset('storage/' . $image->image_path),
                'is_primary' => $image->is_primary,
                'alt_text' => $image->alt_text
            ];
        })->toArray() : []
    ];
    
    // Transform vendor data for frontend
    $vendorData = [
        'id' => $service->vendorStore->id,
        'business_name' => $service->vendorStore->business_name,
        'description' => $service->vendorStore->description,
        'address' => $service->vendorStore->address,
        'contact_phone' => $service->vendorStore->contact_phone,
        'contact_email' => $service->vendorStore->contact_email,
        'rating' => $service->rating ?? 4.8, // Use service rating or default
        'total_reviews' => $service->total_reviews ?? 0,
        'verified' => true, // You can add a verified field to vendor_stores table later
        'response_time' => $service->response_time ?? 'Within 24 hours',
        'vendor_image' => $service->vendorStore->vendor_image
    ];

    return Inertia::render('servicedetails', [
        'service' => $serviceData,
        'vendor' => $vendorData
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