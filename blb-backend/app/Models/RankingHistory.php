<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RankingHistory extends Model
{
    use HasFactory;

    // Libera a inserção em massa para estas colunas
    protected $fillable = [
        'user_id',
        'level',
        'xp',
        'betelcoins',
        'rank_position',
        'week_date'
    ];
}
