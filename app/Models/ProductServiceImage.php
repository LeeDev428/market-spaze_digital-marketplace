<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductServiceImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'vendor_product_service_id',
        'image_path',
        'alt_text',
        'sort_order',
        'is_primary'
    ];

    protected $casts = [
        'is_primary' => 'boolean'
    ];

    // Relationships
    public function vendorProductService()
    {
        return $this->belongsTo(VendorProductService::class, 'vendor_product_service_id');
    }
}

use Illuminate\Database\Eloquent\Model;

class ProductServiceImage extends Model
{
    //
}
