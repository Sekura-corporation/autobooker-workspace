<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    protected $fillable = [
        'name',
        'price',
        'billing_cycle',
        'setup_fee',
        'platform_commission',
        'commission_type',
        'store_limit',
        'appointment_limit',
        'support_level',
        'description',
        'features',
        'revenue_model',
        'status',
        'is_featured',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'setup_fee' => 'decimal:2',
        'platform_commission' => 'decimal:2',
        'store_limit' => 'integer',
        'features' => 'array',
        'revenue_model' => 'array',
        'is_featured' => 'boolean',
    ];
}
