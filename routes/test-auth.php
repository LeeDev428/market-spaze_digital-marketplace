<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Test authentication route
Route::get('/test-auth', function (Request $request) {
    $user = $request->user();
    
    return response()->json([
        'authenticated' => $user ? true : false,
        'user' => $user ? [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'user_type' => $user->user_type ?? 'customer'
        ] : null,
        'session_id' => $request->session()->getId(),
        'csrf_token' => csrf_token()
    ]);
});
