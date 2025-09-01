<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;

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

Route::get('/debug-user-verification', function() {
    $user = Auth::user();
    if (!$user) {
        return response()->json(['error' => 'Not authenticated']);
    }
    
    return response()->json([
        'user_id' => $user->id,
        'email' => $user->email,
        'email_verified_at' => $user->email_verified_at,
        'email_verified_at_timestamp' => $user->email_verified_at ? $user->email_verified_at->toDateTimeString() : null,
        'google_id' => $user->google_id ?? null,
        'current_time' => now()->toDateTimeString(),
    ]);
})->name('debug.user.verification');
