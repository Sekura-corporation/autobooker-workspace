<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LoyaltyReward extends Model
{
    protected $fillable = [
        'store_id',
        'name',
        'points_cost',
        'active',
    ];

    protected $casts = [
        'active' => 'boolean',
    ];
}