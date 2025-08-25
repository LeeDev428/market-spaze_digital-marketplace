<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Rider;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RiderRegisterController extends Controller
{
    /**
     * Display the rider registration view.
     */
    public function create(): Response
    {
        return Inertia::render('auth/rider-register');
    }

    /**
     * Handle an incoming rider registration request.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:riders',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'phone' => 'required|string|max:20',
            'vehicle_type' => 'required|string|in:motorcycle,bicycle,car,truck,van',
            'license_number' => 'required|string|max:50',
        ]);

        // Generate unique rider ID
        $riderIdNumber = str_pad(Rider::count() + 1, 6, '0', STR_PAD_LEFT);
        $riderId = 'RDR' . $riderIdNumber;

        // Ensure rider ID is unique
        while (Rider::where('rider_id', $riderId)->exists()) {
            $riderIdNumber = str_pad(random_int(1, 999999), 6, '0', STR_PAD_LEFT);
            $riderId = 'RDR' . $riderIdNumber;
        }

        $rider = Rider::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'rider_id' => $riderId,
            'phone' => $request->phone,
            'vehicle_type' => $request->vehicle_type,
            'license_number' => $request->license_number,
            'status' => 'offline',
            'rating' => 5.00,
            'total_deliveries' => 0,
            'is_verified' => false, // Riders need admin approval
        ]);

        event(new Registered($rider));

        // Login the rider using the 'rider' guard
        Auth::guard('rider')->login($rider);

        // Redirect to email verification notice for riders
        return redirect()->route('verification.notice')->with('success', 'Registration successful! Please verify your email address.');
    }
}
