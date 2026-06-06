<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Store extends Model
{
    protected $fillable = [
        'owner_id',
        'name',
        'cnpj',
        'phone',
        'email',
        'address',
        'city',
        'state',
        'zip_code',
        'description',
        'opening_hours',
        'plan_id',
        'status',
        'logo_url',
        'banner_url',
    ];

    protected $casts = [
        // 'status' => 'boolean', // removido pois agora é string
    ];

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function services(): HasMany
    {
        return $this->hasMany(Service::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class, 'plan_id');
    }
}
