<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AppointmentController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Appointment History API
Route::get('/appointments/user-history/{email}', [AppointmentController::class, 'getUserHistory'])
    ->name('api.appointments.user-history');

// Test route for debugging
Route::get('/test-history/{email}', function ($email) {
    return (new AppointmentController())->getUserHistory($email);
});

// Include Messages API routes
require __DIR__.'/messages.php';