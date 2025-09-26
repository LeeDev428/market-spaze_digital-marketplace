<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Models\VendorStore;
use App\Models\VendorProductService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class VendorStoreController extends Controller
{
    /**
     * Display a listing of vendor stores.
     */
    public function index(Request $request)
    {
        $query = VendorStore::where('user_id', Auth::id())
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
        if ($vendorStore->user_id !== Auth::id()) {
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
        if ($vendorStore->user_id !== Auth::id()) {
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
            
            // Enhanced validation for ALL database fields
            'productServices.*.name' => 'required|string',
            'productServices.*.description' => 'required|string',
            'productServices.*.priceMin' => 'required|numeric|min:0',
            'productServices.*.priceMax' => 'required|numeric|min:0',
            'productServices.*.category' => 'required|string|max:255',
            'productServices.*.durationMinutes' => 'nullable|integer|min:0',
            'productServices.*.discountPercentage' => 'nullable|numeric|min:0|max:100',
            'productServices.*.responseTime' => 'nullable|string',
            'productServices.*.includes' => 'nullable|string',
            'productServices.*.requirements' => 'nullable|string',
            'productServices.*.tags' => 'nullable|string',
            'productServices.*.specialInstructions' => 'nullable|string',
            
            // Boolean fields
            'productServices.*.isPopular' => 'boolean',
            'productServices.*.isGuaranteed' => 'boolean',
            'productServices.*.isProfessional' => 'boolean',
            'productServices.*.hasWarranty' => 'boolean',
            'productServices.*.pickupAvailable' => 'boolean',
            'productServices.*.deliveryAvailable' => 'boolean',
            'productServices.*.emergencyService' => 'boolean',
            
            // Warranty fields
            'productServices.*.warrantyDays' => 'nullable|integer|min:1',
            
            // Image files (multiple images per service)
            'productServices.*.images' => 'nullable|array',
            'productServices.*.images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:5120', // 5MB max per image
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
            'user_id' => Auth::id(),
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

        // Create products/services with ALL enhanced fields
        foreach ($validated['productServices'] as $productService) {
            if (!empty(trim($productService['name']))) {
                // Parse includes, requirements, and tags arrays (from textarea/input strings)
                $includes = [];
                if (!empty($productService['includes'])) {
                    $includes = array_filter(array_map('trim', preg_split('/[\n,]+/', $productService['includes'])));
                }

                $requirements = [];
                if (!empty($productService['requirements'])) {
                    $requirements = array_filter(array_map('trim', preg_split('/[\n,]+/', $productService['requirements'])));
                }

                $tags = [];
                if (!empty($productService['tags'])) {
                    $tags = array_filter(array_map('trim', explode(',', $productService['tags'])));
                }

                // Create the product/service record with ALL database fields
                $createdService = VendorProductService::create([
                    'vendor_store_id' => $vendorStore->id,
                    'name' => $productService['name'],
                    'description' => $productService['description'],
                    'price_min' => $productService['priceMin'],
                    'price_max' => $productService['priceMax'],
                    'category' => $productService['category'],
                    'duration_minutes' => $productService['durationMinutes'] ?: null,
                    'discount_percentage' => $productService['discountPercentage'] ?: 0,
                    'response_time' => $productService['responseTime'] ?: null,
                    'includes' => !empty($includes) ? $includes : null,
                    'requirements' => !empty($requirements) ? $requirements : null,
                    'tags' => !empty($tags) ? $tags : null,
                    'special_instructions' => $productService['specialInstructions'] ?: null,
                    
                    // Boolean fields with proper defaults
                    'is_popular' => $productService['isPopular'] ?? false,
                    'is_guaranteed' => $productService['isGuaranteed'] ?? true,
                    'is_professional' => $productService['isProfessional'] ?? true,
                    'has_warranty' => $productService['hasWarranty'] ?? false,
                    'pickup_available' => $productService['pickupAvailable'] ?? false,
                    'delivery_available' => $productService['deliveryAvailable'] ?? false,
                    'emergency_service' => $productService['emergencyService'] ?? false,
                    
                    // Warranty fields
                    'warranty_days' => ($productService['hasWarranty'] && !empty($productService['warrantyDays'])) 
                        ? (int)$productService['warrantyDays'] : null,
                    
                    // Default values for fields not in form yet
                    'rating' => 0.0,
                    'rating_count' => 0,
                    'bookings_count' => 0,
                    'is_active' => true
                ]);

                // Handle multiple image uploads for this service
                // Note: Frontend sends images as files in the productServices array
                if (isset($productService['images']) && is_array($productService['images'])) {
                    foreach ($productService['images'] as $index => $image) {
                        if ($image instanceof \Illuminate\Http\UploadedFile) {
                            $imagePath = $image->store('product-service-images', 'public');
                            
                            // Create image record in product_service_images table
                            $createdService->images()->create([
                                'image_path' => $imagePath,
                                'alt_text' => $productService['name'] . ' - Image ' . ($index + 1),
                                'sort_order' => $index,
                                'is_primary' => $index === 0, // First image is primary
                            ]);
                        }
                    }
                }
            }
        }

        return redirect()->route('vendor.store.index')
            ->with('success', 'Store created successfully with ' . count($validated['productServices']) . ' products/services!');
    }

    /**
     * Update the specified store.
     */
    public function update(Request $request, VendorStore $vendorStore)
    {
        // Check if the store belongs to the authenticated user
        if ($vendorStore->user_id !== auth()->user()->id) {
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
            
            // Enhanced validation for ALL database fields
            'productServices.*.name' => 'required|string',
            'productServices.*.description' => 'required|string',
            'productServices.*.priceMin' => 'required|numeric|min:0',
            'productServices.*.priceMax' => 'required|numeric|min:0',
            'productServices.*.category' => 'required|string|max:255',
            'productServices.*.durationMinutes' => 'nullable|integer|min:0',
            'productServices.*.discountPercentage' => 'nullable|numeric|min:0|max:100',
            'productServices.*.responseTime' => 'nullable|string',
            'productServices.*.includes' => 'nullable|string',
            'productServices.*.requirements' => 'nullable|string',
            'productServices.*.tags' => 'nullable|string',
            'productServices.*.specialInstructions' => 'nullable|string',
            
            // Boolean fields
            'productServices.*.isPopular' => 'boolean',
            'productServices.*.isGuaranteed' => 'boolean',
            'productServices.*.isProfessional' => 'boolean',
            'productServices.*.hasWarranty' => 'boolean',
            'productServices.*.pickupAvailable' => 'boolean',
            'productServices.*.deliveryAvailable' => 'boolean',
            'productServices.*.emergencyService' => 'boolean',
            
            // Warranty fields
            'productServices.*.warrantyDays' => 'nullable|integer|min:1',
            
            // Image files (multiple images per service)
            'productServices.*.images' => 'nullable|array',
            'productServices.*.images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:5120', // 5MB max per image
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

        // Delete existing products/services and their images
        foreach ($vendorStore->productsServices as $existingService) {
            // Delete associated images from storage
            foreach ($existingService->images as $image) {
                Storage::disk('public')->delete($image->image_path);
            }
        }
        $vendorStore->productsServices()->delete();

        // Create new products/services with ALL enhanced fields
        foreach ($validated['productServices'] as $productService) {
            if (!empty(trim($productService['name']))) {
                // Parse includes, requirements, and tags arrays (from textarea/input strings)
                $includes = [];
                if (!empty($productService['includes'])) {
                    $includes = array_filter(array_map('trim', preg_split('/[\n,]+/', $productService['includes'])));
                }

                $requirements = [];
                if (!empty($productService['requirements'])) {
                    $requirements = array_filter(array_map('trim', preg_split('/[\n,]+/', $productService['requirements'])));
                }

                $tags = [];
                if (!empty($productService['tags'])) {
                    $tags = array_filter(array_map('trim', explode(',', $productService['tags'])));
                }

                // Create the product/service record with ALL database fields
                $createdService = VendorProductService::create([
                    'vendor_store_id' => $vendorStore->id,
                    'name' => $productService['name'],
                    'description' => $productService['description'],
                    'price_min' => $productService['priceMin'],
                    'price_max' => $productService['priceMax'],
                    'category' => $productService['category'],
                    'duration_minutes' => $productService['durationMinutes'] ?: null,
                    'discount_percentage' => $productService['discountPercentage'] ?: 0,
                    'response_time' => $productService['responseTime'] ?: null,
                    'includes' => !empty($includes) ? $includes : null,
                    'requirements' => !empty($requirements) ? $requirements : null,
                    'tags' => !empty($tags) ? $tags : null,
                    'special_instructions' => $productService['specialInstructions'] ?: null,
                    
                    // Boolean fields with proper defaults
                    'is_popular' => $productService['isPopular'] ?? false,
                    'is_guaranteed' => $productService['isGuaranteed'] ?? true,
                    'is_professional' => $productService['isProfessional'] ?? true,
                    'has_warranty' => $productService['hasWarranty'] ?? false,
                    'pickup_available' => $productService['pickupAvailable'] ?? false,
                    'delivery_available' => $productService['deliveryAvailable'] ?? false,
                    'emergency_service' => $productService['emergencyService'] ?? false,
                    
                    // Warranty fields
                    'warranty_days' => ($productService['hasWarranty'] && !empty($productService['warrantyDays'])) 
                        ? (int)$productService['warrantyDays'] : null,
                    
                    // Default values for fields not in form yet
                    'rating' => 0.0,
                    'rating_count' => 0,
                    'bookings_count' => 0,
                    'is_active' => true
                ]);

                // Handle multiple image uploads for this service
                if (isset($productService['images']) && is_array($productService['images'])) {
                    foreach ($productService['images'] as $index => $image) {
                        if ($image instanceof \Illuminate\Http\UploadedFile) {
                            $imagePath = $image->store('product-service-images', 'public');
                            
                            // Create image record in product_service_images table
                            $createdService->images()->create([
                                'image_path' => $imagePath,
                                'alt_text' => $productService['name'] . ' - Image ' . ($index + 1),
                                'sort_order' => $index,
                                'is_primary' => $index === 0, // First image is primary
                            ]);
                        }
                    }
                }
            }
        }

        return redirect()->route('vendor.store.index')
            ->with('success', 'Store updated successfully with ' . count($validated['productServices']) . ' products/services!');
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