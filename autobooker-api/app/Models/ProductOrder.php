<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductOrder extends Model
{
    protected $fillable = [
        'client_id',
        'store_id',
        'total_price',
        'status',
    ];

    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function store()
    {
        return $this->belongsTo(Store::class);
    }

    public function items()
    {
        return $this->hasMany(ProductOrderItem::class);
    }
}