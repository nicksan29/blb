<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MissionSubmission extends Model
{
    use HasFactory;

    protected $fillable = [
        'mission_id',
        'user_id',
        'proof_text',
        'proof_image_path',
        'status',
        'rejection_reason',
    ];

    // Relações para podermos buscar os dados do usuário e da missão
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function mission()
    {
        return $this->belongsTo(Mission::class);
    }
}
