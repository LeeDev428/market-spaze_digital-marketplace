<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class Rider extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'rider_id',
        'phone',
        'vehicle_type',
        'license_number',
        'status',
        'rating',
        'total_deliveries',
        'is_verified',
        'is_activated',
        'is_online',
        'location_lat',
        'location_lng',
        'current_latitude',
        'current_longitude',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'rating' => 'decimal:2',
        'total_deliveries' => 'integer',
        'is_verified' => 'boolean',
        'is_activated' => 'boolean',
        'is_online' => 'boolean',
        'location_lat' => 'decimal:8',
        'location_lng' => 'decimal:8',
    ];

    // ✅ REMOVED: user() relationship since riders are now independent

    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }

    public function deliveries()
    {
        return $this->hasMany(Delivery::class);
    }

    public function riderEarnings()
    {
        return $this->hasMany(RiderEarning::class);
    }

    public function earnings()
    {
        return $this->hasMany(RiderEarning::class);
    }

    // Scopes
    public function scopeAvailable($query)
    {
        return $query->where('status', 'available')->where('is_verified', true);
    }

    public function scopeOnline($query)
    {
        return $query->whereIn('status', ['available', 'busy']);
    }
}