<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Models\VendorStore;
use App\Models\VendorProductService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class VendorStoreController extends Controller
{
    /**
     * Display a listing of vendor stores.
     */
    public function index(Request $request)
    {
        $query = VendorStore::where('user_id', auth()->id())
            ->withCount('productsServices');

        // Apply filters
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('business_name', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->filled('business_type')) {
            $query->where('business_type', $request->business_type);
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $stores = $query->orderBy('created_at', 'desc')->get();

        return Inertia::render('vendor/store/Index_store', [
            'stores' => $stores,
            'filters' => $request->only(['search', 'business_type', 'is_active'])
        ]);
    }

    /**
     * Show the form for creating a new store.
     */
    public function create()
    {
        return Inertia::render('vendor/store/Create_store');
    }

    /**
     * Display the specified store.
     */
    public function show(VendorStore $vendorStore)
    {
        // Check if the store belongs to the authenticated user
        if ($vendorStore->user_id !== auth()->id()) {
            abort(403);
        }

        $vendorStore->load('productsServices');

        return Inertia::render('vendor/store/Show_store', [
            'vendorStore' => $vendorStore,
            'productsServices' => $vendorStore->productsServices
        ]);
    }

    /**
     * Show the form for editing the specified store.
     */
    public function edit(VendorStore $vendorStore)
    {
        // Check if the store belongs to the authenticated user
        if ($vendorStore->user_id !== auth()->id()) {
            abort(403);
        }

        $vendorStore->load('productsServices');

        return Inertia::render('vendor/store/Edit_store', [
            'vendorStore' => $vendorStore,
            'productsServices' => $vendorStore->productsServices
        ]);
    }

    /**
     * Store a newly created store.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'businessName' => 'required|string|max:255',
            'description' => 'required|string',
            'businessType' => 'required|in:products,services',
            'address' => 'required|string',
            'serviceableAreas' => 'required|array|min:1',
            'serviceableAreas.*' => 'required|string',
            'contactPhone' => 'required|string',
            'contactEmail' => 'required|email',
            'serviceDescription' => 'nullable|string',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'productServices' => 'required|array|min:1',
            'productServices.*.name' => 'required|string',
            'productServices.*.description' => 'required|string',
            'productServices.*.priceMin' => 'required|numeric|min:0',
            'productServices.*.priceMax' => 'required|numeric|min:0',
            'productServices.*.category' => 'required|string|max:255',
            'productServices.*.durationMinutes' => 'nullable|integer|min:0',
            'productServices.*.discountPercentage' => 'nullable|numeric|min:0|max:100',
            'productServices.*.includes' => 'nullable|string',
            'productServices.*.requirements' => 'nullable|string',
            'productServices.*.warrantyInfo' => 'nullable|string|max:255',
            'productServices.*.pickupAvailable' => 'boolean',
            'productServices.*.deliveryAvailable' => 'boolean',
        ]);

        // Handle logo upload
        $logoPath = null;
        if ($request->hasFile('logo')) {
            $logoPath = $request->file('logo')->store('vendor-logos', 'public');
        }

        // Filter out empty serviceable areas
        $serviceableAreas = array_filter($validated['serviceableAreas'], function($area) {
            return !empty(trim($area));
        });

        // Create vendor store
        $vendorStore = VendorStore::create([
            'user_id' => auth()->id(),
            'business_name' => $validated['businessName'],
            'description' => $validated['description'],
            'business_type' => $validated['businessType'],
            'address' => $validated['address'],
            'serviceable_areas' => array_values($serviceableAreas),
            'contact_phone' => $validated['contactPhone'],
            'contact_email' => $validated['contactEmail'],
            'service_description' => $validated['serviceDescription'],
            'logo_path' => $logoPath,
            'setup_completed' => true,
            'is_active' => true
        ]);

        // Create products/services with enhanced fields
        foreach ($validated['productServices'] as $productService) {
            if (!empty(trim($productService['name']))) {
                // Parse includes and requirements arrays (from textarea strings)
                $includes = [];
                if (!empty($productService['includes'])) {
                    $includes = array_filter(array_map('trim', explode("\n", $productService['includes'])));
                }

                $requirements = [];
                if (!empty($productService['requirements'])) {
                    $requirements = array_filter(array_map('trim', explode("\n", $productService['requirements'])));
                }

                VendorProductService::create([
                    'vendor_store_id' => $vendorStore->id,
                    'name' => $productService['name'],
                    'description' => $productService['description'],
                    'price_min' => $productService['priceMin'],
                    'price_max' => $productService['priceMax'],
                    'category' => $productService['category'],
                    'duration_minutes' => $productService['durationMinutes'] ?: null,
                    'discount_percentage' => $productService['discountPercentage'] ?: 0,
                    'includes' => !empty($includes) ? $includes : null,
                    'requirements' => !empty($requirements) ? $requirements : null,
                    'warranty_info' => $productService['warrantyInfo'] ?: null,
                    'pickup_available' => $productService['pickupAvailable'] ?? false,
                    'delivery_available' => $productService['deliveryAvailable'] ?? false,
                    'is_active' => true
                ]);
            }
        }

        return redirect()->route('vendor.store.index')
            ->with('success', 'Store created successfully!');
    }

    /**
     * Update the specified store.
     */
    public function update(Request $request, VendorStore $vendorStore)
    {
        // Check if the store belongs to the authenticated user
        if ($vendorStore->user_id !== auth()->id()) {
            abort(403);
        }

        $validated = $request->validate([
            'businessName' => 'required|string|max:255',
            'description' => 'required|string',
            'businessType' => 'required|in:products,services',
            'address' => 'required|string',
            'serviceableAreas' => 'required|array|min:1',
            'serviceableAreas.*' => 'required|string',
            'contactPhone' => 'required|string',
            'contactEmail' => 'required|email',
            'serviceDescription' => 'nullable|string',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'productServices' => 'required|array|min:1',
            'productServices.*.name' => 'required|string',
            'productServices.*.description' => 'required|string',
            'productServices.*.priceMin' => 'required|numeric|min:0',
            'productServices.*.priceMax' => 'required|numeric|min:0',
        ]);

        // Handle logo upload
        $logoPath = $vendorStore->logo_path;
        if ($request->hasFile('logo')) {
            // Delete old logo
            if ($logoPath) {
                Storage::disk('public')->delete($logoPath);
            }
            $logoPath = $request->file('logo')->store('vendor-logos', 'public');
        }

        // Filter out empty serviceable areas
        $serviceableAreas = array_filter($validated['serviceableAreas'], function($area) {
            return !empty(trim($area));
        });

        // Update vendor store
        $vendorStore->update([
            'business_name' => $validated['businessName'],
            'description' => $validated['description'],
            'business_type' => $validated['businessType'],
            'address' => $validated['address'],
            'serviceable_areas' => array_values($serviceableAreas),
            'contact_phone' => $validated['contactPhone'],
            'contact_email' => $validated['contactEmail'],
            'service_description' => $validated['serviceDescription'],
            'logo_path' => $logoPath,
        ]);

        // Delete existing products/services
        $vendorStore->productsServices()->delete();

        // Create new products/services
        foreach ($validated['productServices'] as $productService) {
            if (!empty(trim($productService['name']))) {
                VendorProductService::create([
                    'vendor_store_id' => $vendorStore->id,
                    'name' => $productService['name'],
                    'description' => $productService['description'],
                    'price_min' => $productService['priceMin'],
                    'price_max' => $productService['priceMax'],
                    'is_active' => true
                ]);
            }
        }

        return redirect()->route('vendor.store.index')
            ->with('success', 'Store updated successfully!');
    }

    /**
     * Remove the specified store.
     */
    public function destroy(VendorStore $vendorStore)
    {
        // Check if the store belongs to the authenticated user
        if ($vendorStore->user_id !== auth()->id()) {
            abort(403);
        }

        // Delete logo if exists
        if ($vendorStore->logo_path) {
            Storage::disk('public')->delete($vendorStore->logo_path);
        }

        $vendorStore->delete();

        return redirect()->route('vendor.store.index')
            ->with('success', 'Store deleted successfully!');
    }
}