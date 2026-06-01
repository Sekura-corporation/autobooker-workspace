<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockItem extends Model
{
    protected $fillable = [
        'store_id',
        'category_id',
        'name',
        'type',
        'quantity',
        'min_quantity',
        'sale_price',
    ];

    public function store()
    {
        return $this->belongsTo(Store::class);
    }

    public function category()
    {
        return $this->belongsTo(StockCategory::class, 'category_id');
    }

    public function movements()
    {
        return $this->hasMany(StockMovement::class, 'stock_item_id');
    }
}