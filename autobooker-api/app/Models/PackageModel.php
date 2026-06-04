<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PackageModel extends Model
{
    protected $fillable = [
        'store_id',
        'name',
        'description',
        'price',
        'sessions',
        'validity_days',
    ];

    public function store()
    {
        return $this->belongsTo(Store::class);
    }
}
