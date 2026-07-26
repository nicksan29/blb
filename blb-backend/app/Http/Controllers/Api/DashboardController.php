<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Cache;

class DashboardController extends Controller
{
    public function ranking(Request $request)
    {
        // Verifica o status do ranking no cache (Padrão é true / visível)
        $isRankingVisible = Cache::get('ranking_is_visible', true);
        $user = $request->user();

        // Se o ranking estiver oculto e o usuário não for admin, retorna vazio
        if (!$isRankingVisible && $user->role !== 'admin') {
            return response()->json([
                'is_visible' => false,
                'level_ranking' => [],
                'betelcoins_ranking' => []
            ]);
        }

        $levelRanking = User::where('role', 'dbv')
                            ->orderBy('level', 'desc')
                            ->orderBy('xp', 'desc')
                            ->get(['id', 'name', 'avatar_path', 'level', 'xp']);

        $betelcoinsRanking = User::where('role', 'dbv')
                                 ->orderBy('betelcoins', 'desc')
                                 ->get(['id', 'name', 'avatar_path', 'betelcoins']);

        return response()->json([
            'is_visible' => $isRankingVisible,
            'level_ranking' => $levelRanking,
            'betelcoins_ranking' => $betelcoinsRanking
        ]);
    }

    // Método exclusivo da Diretoria para alternar a visibilidade
    public function toggleRankingStatus()
    {
        $currentStatus = Cache::get('ranking_is_visible', true);
        Cache::put('ranking_is_visible', !$currentStatus);

        $statusName = !$currentStatus ? 'VISÍVEL' : 'OCULTO';
        return response()->json(['message' => "O ranking geral agora está {$statusName} para os desbravadores."]);
    }
}
