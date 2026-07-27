<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Mission;
use App\Models\MissionSubmission;
use App\Models\StoreItem;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;
use App\Models\Notification;

class MissionController extends Controller
{
    // ==========================================
    // ROTAS PÚBLICAS (Desbravadores)
    // ==========================================

    // Lista missões ativas
    public function index(Request $request)
    {
        $user = $request->user();

        // Pega as missões onde a data de expiração é nula OU é maior que o momento atual
        $missions = Mission::where(function ($query) {
            $query->whereNull('expires_at')
                ->orWhere('expires_at', '>=', Carbon::now()); // Usa o Carbon para garantir a hora certa
        })
            // Traz a submissão DO usuário logado para pintarmos a tela de verde/amarelo
            ->with(['submissions' => function ($q) use ($user) {
                $q->where('user_id', $user->id)->latest();
            }])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($missions);
    }

    // Na função store(), adicione a validação: 'expires_at' => 'nullable|date'

    // Novos métodos para a Diretoria:
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'title' => 'required|string',
            'description' => 'required|string',
            'category' => 'required|string|in:Natureza,Espiritual,Física,Mental',
            'reward_xp' => 'required|integer|min:0',
            'reward_btlcs' => 'required|integer|min:0',
            'expires_at' => 'nullable|date', // <-- Regra nova aqui
        ]);

        $mission = Mission::findOrFail($id);
        $mission->update($validated);
        return response()->json(['message' => 'Missão atualizada!']);
    }
    public function destroy($id)
    {
        // Deleta as evidências ligadas para o MySQL não bloquear a exclusão da missão
        MissionSubmission::where('mission_id', $id)->delete();

        // Agora deleta a missão
        Mission::destroy($id);

        return response()->json(['message' => 'Missão e suas evidências foram excluídas!']);
    }

    // DBV envia a missão com foto e texto
    public function submit(Request $request, $id)
    {
        $user = $request->user();

        // Bloqueia se já tiver uma submissão Pendente ou Aprovada
        $existing = \App\Models\MissionSubmission::where('mission_id', $id)
            ->where('user_id', $user->id)
            ->whereIn('status', ['pending', 'approved'])
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Você já enviou esta missão!'], 400);
        }

        $request->validate([
            'proof_text' => 'required|string',
            'proof_media' => 'nullable|array',
            'proof_media.*' => 'file|mimes:jpeg,png,jpg,webp,mp4,mov,avi,wmv|max:51200',
        ]);

        $mediaPaths = [];
        if ($request->hasFile('proof_media')) {
            foreach ($request->file('proof_media') as $file) {
                $mediaPaths[] = $file->store('missions/proofs', 'public');
            }
        }

        \App\Models\MissionSubmission::create([
            'mission_id' => $id,
            'user_id' => $user->id,
            'proof_text' => $request->proof_text,
            'proof_image_path' => count($mediaPaths) > 0 ? $mediaPaths[0] : null, // Fallback para manter retrocompatibilidade
            'media_paths' => $mediaPaths,
            'status' => 'pending' // Fica amarelo para o DBV
        ]);

        Notification::create([
            'type' => 'mission',
            'message' => "O desbravador {$user->name} enviou evidência para a missão de ID {$id}.",
            'for_admin' => true,
        ]);

        return response()->json(['message' => 'Missão enviada para análise!']);
    }

    public function approveSubmission($id)
    {
        $submission = MissionSubmission::with(['user', 'mission'])->findOrFail($id);

        if ($submission->status === 'approved') {
            return response()->json(['message' => 'Já aprovada.'], 400);
        }

        $user = $submission->user;
        $mission = $submission->mission;

        // --- XP BONUS LOGIC ---
        // Conta quantas submissões JÁ foram aprovadas para esta missão
        $approvedCount = MissionSubmission::where('mission_id', $mission->id)
                                          ->where('status', 'approved')
                                          ->count();

        $bonusXp = 0;
        $bonusText = '';
        if ($approvedCount === 0) {
            $bonusXp = 20;
            $bonusText = ' (+20 XP de Bônus por ser o 1º!)';
        } elseif ($approvedCount === 1) {
            $bonusXp = 12;
            $bonusText = ' (+12 XP de Bônus por ser o 2º!)';
        } elseif ($approvedCount === 2) {
            $bonusXp = 5;
            $bonusText = ' (+5 XP de Bônus por ser o 3º!)';
        }

        // 1. Soma os Btlcs e XP
        $user->betelcoins += $mission->reward_btlcs;
        $totalXpGained = $mission->reward_xp + $bonusXp;

        // 2. Calcula a matemática do XP e Nível
        $totalXp = $user->xp + $totalXpGained;
        $levelsGained = floor($totalXp / 100);
        $newXp = $totalXp % 100;

        $user->level += $levelsGained;
        $user->xp = $newXp;
        $user->save();

        // 3. Atualiza o status do envio
        $submission->update(['status' => 'approved']);

        Notification::create([
            'user_id' => $user->id,
            'type' => 'mission',
            'message' => "Sua missão '{$mission->title}' foi aprovada! Você ganhou {$totalXpGained} XP{$bonusText} e {$mission->reward_btlcs} Btlcs.",
        ]);

        return response()->json(['message' => 'Missão aprovada! Pontos creditados.']);
    }

    // Recusa e manda o motivo pro Enzo refazer
    public function rejectSubmission(Request $request, $id)
    {
        $request->validate(['rejection_reason' => 'required|string']);

        $submission = \App\Models\MissionSubmission::findOrFail($id);
        $submission->update([
            'status' => 'rejected',
            'rejection_reason' => $request->rejection_reason
        ]);

        Notification::create([
            'user_id' => $submission->user_id,
            'type' => 'mission',
            'message' => "Sua missão foi reprovada. Motivo: {$request->rejection_reason}",
        ]);

        return response()->json(['message' => 'Missão recusada e devolvida ao desbravador.']);
    }

    // ==========================================
    // ROTAS DA DIRETORIA (Admin)
    // ==========================================

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string',
            'description' => 'required|string',
            'category' => 'required|string|in:Natureza,Espiritual,Física,Mental',
            'reward_xp' => 'required|integer|min:0',
            'reward_btlcs' => 'required|integer|min:0',
            'expires_at' => 'nullable|date',
            'mission_media' => 'nullable|array',
            'mission_media.*' => 'file|mimes:jpeg,png,jpg,webp,mp4,mov,avi,wmv|max:51200',
        ]);

        $mediaPaths = [];
        if ($request->hasFile('mission_media')) {
            foreach ($request->file('mission_media') as $file) {
                $mediaPaths[] = $file->store('missions/admin', 'public');
            }
        }

        // Força a missão a nascer como ativa
        $validated['is_active'] = true;
        $validated['media_paths'] = $mediaPaths;

        $mission = Mission::create($validated);

        Notification::create([
            'type' => 'mission',
            'message' => "Nova Missão lançada: {$mission->title}! Cumpra o requisito e ganhe recompensas.",
        ]);

        return response()->json($mission, 201);
    }

    public function manageMissions()
    {
        // Traz TODAS as missões (para o Admin poder ver as expiradas também)
        $missions = Mission::orderBy('created_at', 'desc')->get();
        return response()->json($missions);
    }

    public function pendingSubmissions()
    {
        // Traz as evidências pendentes INDEPENDENTE se a missão já expirou
        $submissions = MissionSubmission::with(['mission', 'user'])
            ->where('status', 'pending')
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json($submissions);
    }




}
