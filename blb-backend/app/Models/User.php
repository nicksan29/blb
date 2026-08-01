<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens; // Certifique-se de que isso está aqui

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable; // E aqui também

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'unit',
        'avatar_path',
        'level',
        'xp',
        'betelcoins',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function submissions()
    {
        return $this->hasMany(\App\Models\MissionSubmission::class, 'user_id');
    }
}
