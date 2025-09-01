<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'google_id',
        'role',
        'is_activated',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_activated' => 'boolean',
        ];
    }

    /**
     * Override to disable old email verification links
     * We use 6-digit codes instead
     */
    public function sendEmailVerificationNotification()
    {
        // Do nothing - we use 6-digit codes instead of email links
        return;
    }

    /**
     * Override to disable password reset links  
     * We use 6-digit codes instead
     */
    public function sendPasswordResetNotification($token)
    {
        // Do nothing - we use 6-digit codes instead of email links
        return;
    }

    public function rider()
    {
        return $this->hasOne(Rider::class);
    }

    /**
     * Appointments as customer
     */
    public function appointments()
    {
        return $this->hasMany(Appointment::class, 'user_id');
    }

    /**
     * Vendor store if user is a vendor
     */
    public function vendorStore()
    {
        return $this->hasOne(VendorStore::class);
    }

    /**
     * Orders as customer
     */
    public function orders()
    {
        return $this->hasMany(Order::class, 'customer_id');
    }

    /**
     * Orders for vendor's store
     */
    public function vendorOrders()
    {
        return $this->hasManyThrough(Order::class, VendorStore::class, 'user_id', 'vendor_store_id');
    }
}
