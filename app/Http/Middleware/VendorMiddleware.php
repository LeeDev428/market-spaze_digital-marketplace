<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\VendorStore;

class VendorMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        if (!Auth::check() || Auth::user()->role !== 'vendor') {
            abort(403, 'Access denied. Vendor access required.');
        }

        // Get vendor store and share it with all vendor pages
        $vendorStore = VendorStore::where('user_id', Auth::id())->first();
        
        if ($vendorStore) {
            Inertia::share('vendorStore', [
                'id' => $vendorStore->id,
                'business_name' => $vendorStore->business_name,
                'business_type' => $vendorStore->business_type,
                'contact_email' => $vendorStore->contact_email,
                'contact_phone' => $vendorStore->contact_phone,
                'address' => $vendorStore->address,
                'city' => $vendorStore->city,
                'state' => $vendorStore->state,
                'zip_code' => $vendorStore->zip_code,
                'rating' => $vendorStore->rating ?? 4.8,
                'total_reviews' => $vendorStore->total_reviews ?? 0,
                'status' => $vendorStore->status,
            ]);
        }

        return $next($request);
    }
}