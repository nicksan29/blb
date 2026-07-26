<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StoreItem extends Model
{
    use HasFactory;

    // Libera a inserção em massa para estas colunas
    protected $fillable = [
        'name',
        'description',
        'price_btlcs',
        'stock',
        'image_path', // A coluna da imagem que estava faltando!
    ];
}
