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
        'price_min',
        'price_max',
        'is_active'
    ];

    protected $casts = [
        'price_min' => 'decimal:2',
        'price_max' => 'decimal:2',
        'is_active' => 'boolean'
    ];

    // Relationships
    public function vendorStore()
    {
        return $this->belongsTo(VendorStore::class);
    }
}