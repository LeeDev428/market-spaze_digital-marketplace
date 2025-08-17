<?php

namespace App\Http\Controllers\Rider;

use App\Http\Controllers\Controller;
use App\Models\Rider;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class RiderProfileController extends Controller
{
    /**
     * Show rider profile
     */
    public function show()
    {
        $rider = Auth::guard('rider')->user();
        
        if (!$rider) {
            return redirect()->route('login')->with('error', 'Please log in as a rider.');
        }
        
        return Inertia::render('rider/profile/Show', [
            'rider' => $rider,
        ]);
    }
    
    /**
     * Update rider profile
     */
    public function update(Request $request)
    {
        $rider = Auth::guard('rider')->user();
        
        if (!$rider) {
            return redirect()->route('login')->with('error', 'Please log in as a rider.');
        }
        
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . Auth::id(),
            'phone_number' => 'required|string|max:15',
            'vehicle_type' => 'required|in:motorcycle,bicycle,car,van',
            'license_plate' => 'required|string|max:10',
            'driver_license' => 'nullable|string|max:20',
            'avatar' => 'nullable|image|max:2048',
        ]);
        
        // Update user details
        $rider->user->update([
            'name' => $request->name,
            'email' => $request->email,
        ]);
        
        // Handle avatar upload
        $avatarPath = $rider->user->avatar;
        if ($request->hasFile('avatar')) {
            if ($avatarPath) {
                Storage::disk('public')->delete($avatarPath);
            }
            $avatarPath = $request->file('avatar')->store('avatars', 'public');
            $rider->user->update(['avatar' => $avatarPath]);
        }
        
        // Update rider details
        $rider->update([
            'phone_number' => $request->phone_number,
            'vehicle_type' => $request->vehicle_type,
            'license_plate' => $request->license_plate,
            'driver_license' => $request->driver_license,
        ]);
        
        return back()->with('success', 'Profile updated successfully!');
    }
    
    /**
     * Show settings page
     */
    public function settings()
    {
        $rider = Auth::guard('rider')->user();
        
        if (!$rider) {
            return redirect()->route('login')->with('error', 'Please log in as a rider.');
        }
        
        return Inertia::render('rider/profile/Settings', [
            'rider' => $rider,
        ]);
    }
    
    /**
     * Update settings
     */
    public function updateSettings(Request $request)
    {
        $rider = Auth::guard('rider')->user();
        
        if (!$rider) {
            return redirect()->route('login')->with('error', 'Please log in as a rider.');
        }
        
        $request->validate([
            'notifications_enabled' => 'boolean',
            'sms_notifications' => 'boolean',
            'email_notifications' => 'boolean',
            'location_sharing' => 'boolean',
            'auto_accept_orders' => 'boolean',
            'password' => 'nullable|string|min:8|confirmed',
        ]);
        
        // Update rider settings
        $rider->update([
            'notifications_enabled' => $request->notifications_enabled ?? false,
            'sms_notifications' => $request->sms_notifications ?? false,
            'email_notifications' => $request->email_notifications ?? false,
            'location_sharing' => $request->location_sharing ?? false,
            'auto_accept_orders' => $request->auto_accept_orders ?? false,
        ]);
        
        // Update password if provided
        if ($request->filled('password')) {
            $rider->user->update([
                'password' => Hash::make($request->password)
            ]);
        }
        
        return back()->with('success', 'Settings updated successfully!');
    }
}