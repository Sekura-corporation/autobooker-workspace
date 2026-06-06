<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Partnership extends Model
{
    protected $fillable = [
        'store_name',
        'partner_name',
        'partner_type',
        'region',
        'contact_name',
        'contact_email',
        'contact_phone',
        'discount_percent',
        'status',
        'start_date',
        'benefits',
        'notes',
    ];

    protected $casts = [
        'discount_percent' => 'integer',
        'start_date' => 'date',
        'benefits' => 'array',
    ];
}
