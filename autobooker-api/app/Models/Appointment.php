<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Store;
use App\Models\Vehicle;
use App\Models\Service;
use App\Models\PackageModel;

class Appointment extends Model
{
    protected $fillable = [
        'client_id',
        'store_id',
        'vehicle_id',
        'service_id',
        'package_id',
        'appointment_date',
        'appointment_time',
        'status',
        'price',
        'notes',
    ];

    protected $casts = [
        'appointment_date' => 'date',
        'price' => 'decimal:2',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function package()
    {
        return $this->belongsTo(PackageModel::class, 'package_id');
    }
}
