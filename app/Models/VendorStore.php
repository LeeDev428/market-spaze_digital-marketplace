<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VendorStore extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'business_name',
        'description',
        'business_type',
        'address',
        'serviceable_areas',
        'contact_phone',
        'contact_email',
        'service_description',
        'logo_path',
        'is_active',
        'setup_completed'
    ];

    protected $casts = [
        'serviceable_areas' => 'array',
        'is_active' => 'boolean',
        'setup_completed' => 'boolean'
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
    public function productsServices()
    {
        return $this->hasMany(VendorProductService::class);
    }

    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}