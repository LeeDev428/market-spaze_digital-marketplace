<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VendorProductService extends Model
{
    use HasFactory;

    protected $table = 'vendor_product_services';

    protected $fillable = [
        'vendor_store_id',
        'name',
        'description',
        'category',
        'price_min',
        'price_max',
        'duration_minutes',
        'discount_percentage',
        'is_popular',
        'is_guaranteed',
        'is_professional',
        'rating',
        'total_reviews',
        'response_time',
        'includes',
        'requirements',
        'has_warranty',
        'warranty_days',
        'pickup_available',
        'delivery_available',
        'emergency_service',
        'special_instructions',
        'slug',
        'tags',
        'is_active'
    ];

    protected $casts = [
        'price_min' => 'decimal:2',
        'price_max' => 'decimal:2',
        'discount_percentage' => 'decimal:2',
        'rating' => 'decimal:2',
        'is_active' => 'boolean',
        'is_popular' => 'boolean',
        'is_guaranteed' => 'boolean',
        'is_professional' => 'boolean',
        'has_warranty' => 'boolean',
        'pickup_available' => 'boolean',
        'delivery_available' => 'boolean',
        'emergency_service' => 'boolean',
        'includes' => 'array',
        'requirements' => 'array',
        'tags' => 'array'
    ];

    // Relationships
    public function vendorStore()
    {
        return $this->belongsTo(VendorStore::class);
    }

    public function images()
    {
        return $this->hasMany(ProductServiceImage::class, 'vendor_product_service_id')->orderBy('sort_order');
    }

    public function primaryImage()
    {
        return $this->hasOne(ProductServiceImage::class, 'vendor_product_service_id')->where('is_primary', true);
    }

    public function appointments()
    {
        return $this->hasMany(Appointment::class, 'service_id');
    }
}