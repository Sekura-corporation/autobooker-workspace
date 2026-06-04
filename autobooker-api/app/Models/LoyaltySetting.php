<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LoyaltySetting extends Model
{
    protected $fillable = [
        'store_id',
        'spent_value',
        'points_value',
    ];

    public function store()
    {
        return $this->belongsTo(Store::class);
    }
}