<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LoyaltyPoint extends Model
{
    protected $fillable = [
        'client_id',
        'store_id',
        'points'
    ];

    // LoyaltyPoint.php
    public function store()
    {
        return $this->belongsTo(Store::class);
    }

    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }
}
