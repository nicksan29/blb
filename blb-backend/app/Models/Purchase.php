<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Purchase extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'store_item_id',
        'price_paid',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function storeItem()
    {
        return $this->belongsTo(StoreItem::class);
    }
}
