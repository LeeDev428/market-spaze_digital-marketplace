<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RiderNotification extends Model
{
    use HasFactory;

    protected $fillable = [
        'rider_id',
        'title',
        'message',
        'type',
        'is_read',
    ];

    protected $casts = [
        'is_read' => 'boolean',
    ];

    public function rider()
    {
        return $this->belongsTo(Rider::class);
    }
}