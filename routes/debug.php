<?php

use Illuminate\Support\Facades\Route;

Route::get('/debug-google', function() {
    return response()->json([
        'app_url' => config('app.url'),
        'google_client_id' => config('services.google.client_id'),
        'google_redirect' => config('services.google.redirect'),
        'route_callback' => route('google.callback'),
        'current_url' => request()->url(),
        'full_url' => request()->fullUrl(),
    ]);
})->name('debug.google');
