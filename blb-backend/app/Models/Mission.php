<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Mission extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'media_paths',
        'category',
        'reward_xp',
        'reward_btlcs',
        'is_active',
        'expires_at',
    ];

    protected $casts = [
        'media_paths' => 'array',
    ];

    // ESSA É A FUNÇÃO QUE FALTAVA PARA PARAR O ERRO 500!
    public function submissions()
    {
        return $this->hasMany(MissionSubmission::class);
    }
}
