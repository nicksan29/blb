<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\User;
use App\Models\MissionSubmission;
use Illuminate\Support\Facades\DB;

class UnitController extends Controller
{
    public function ranking()
    {
        // Pega todos os desbravadores que têm unidade
        $users = User::whereNotNull('unit')
            ->where('role', 'dbv')
            ->get();

        $unitsScore = [
            'Leões de Judá' => ['total' => 0, 'divider' => 4],
            'Alcatéia Benjamim' => ['total' => 0, 'divider' => 5],
            'Chamas de Aser' => ['total' => 0, 'divider' => 3],
            'Valentes de Gade' => ['total' => 0, 'divider' => 7],
        ];

        foreach ($users as $u) {
            if (isset($unitsScore[$u->unit])) {
                // Pontuação real considerando level e xp
                $score = ($u->level * 100) + $u->xp;
                $unitsScore[$u->unit]['total'] += $score;
            }
        }

        // Pega os conselheiros também
        $counselors = User::whereNotNull('unit')
            ->where('role', 'counselor')
            ->get();

        $ranking = [];
        foreach ($unitsScore as $name => $data) {
            // Separa membros desta unidade e ordena por score (level * 100 + xp)
            $unitMembers = $users->filter(fn($u) => $u->unit === $name)
                                 ->sortByDesc(fn($u) => ($u->level * 100) + $u->xp)
                                 ->values();
            
            $unitCounselors = $counselors->filter(fn($u) => $u->unit === $name)->values();

            $ranking[] = [
                'name' => $name,
                'score' => round($data['total'] / $data['divider'], 2),
                'members' => $unitMembers,
                'counselors' => $unitCounselors
            ];
        }

        // Ordenar do maior para o menor
        usort($ranking, function ($a, $b) {
            return $b['score'] <=> $a['score'];
        });

        return response()->json($ranking);
    }

    public function myUnit(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'counselor') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Traz os desbravadores da mesma unidade
        $members = User::where('unit', $user->unit)
            ->where('role', 'dbv')
            ->orderBy('level', 'desc')
            ->orderBy('xp', 'desc')
            ->get();

        // Para cada membro, traz as submissões ativas
        // Para simplificar no frontend, podemos trazer as missões já feitas
        $members->load(['submissions' => function($q) {
            $q->with('mission');
        }]);

        return response()->json($members);
    }
}
