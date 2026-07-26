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
            'proof_image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:20480',
        ]);

        $path = null;
        if ($request->hasFile('proof_image')) {
            $path = $request->file('proof_image')->store('missions/proofs', 'public');
        }

        \App\Models\MissionSubmission::create([
            'mission_id' => $id,
            'user_id' => $user->id,
            'proof_text' => $request->proof_text,
            'proof_image_path' => $path,
            'status' => 'pending' // Fica amarelo para o DBV
        ]);

        Notification::create([
            'type' => 'mission',
            'message' => "O desbravador {$user->name} enviou evidência para a missão de ID {$id}.",
        ]);

        return response()->json(['message' => 'Missão enviada para análise!']);
    }

    public function approveSubmission($id)
    {
        $submission = \App\Models\MissionSubmission::with('mission', 'user')->findOrFail($id);

        if ($submission->status === 'approved') {
            return response()->json(['message' => 'Já aprovada.'], 400);
        }

        $submission->update(['status' => 'approved']);

        // Adiciona XP e Betelcoins ao DBV
        $submission->user->increment('xp', $submission->mission->reward_xp);
        $submission->user->increment('betelcoins', $submission->mission->reward_btlcs);

        // Regra de subir de nível a cada 100 XP (Exemplo)
        if ($submission->user->xp >= 100) {
            $submission->user->increment('level');
            $submission->user->decrement('xp', 100);
        }

        Notification::create([
            'user_id' => $submission->user_id,
            'type' => 'mission',
            'message' => "Sua missão '{$submission->mission->title}' foi aprovada! Você ganhou {$submission->mission->reward_xp} XP e {$submission->mission->reward_btlcs} Btlcs.",
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
            'reward_xp' => 'required|integer|min:0',
            'reward_btlcs' => 'required|integer|min:0',
            'expires_at' => 'nullable|date',
        ]);

        // Força a missão a nascer como ativa
        $validated['is_active'] = true;

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



    // Aprova a missão e processa o LEVEL UP
    public function approve($id)
    {
        $submission = MissionSubmission::with(['user', 'mission'])->findOrFail($id);

        if ($submission->status !== 'pending') {
            return response()->json(['message' => 'Esta missão já foi processada.'], 400);
        }

        $user = $submission->user;
        $mission = $submission->mission;

        // 1. Soma os Btlcs
        $user->betelcoins += $mission->reward_btlcs;

        // 2. Calcula a matemática do XP e Nível
        $totalXp = $user->xp + $mission->reward_xp;

        // Quantos níveis ele ganhou? (ex: 150 XP / 100 = 1 nível ganho)
        $levelsGained = floor($totalXp / 100);

        // Qual o XP que sobra? (ex: 150 XP % 100 = 50 XP restantes)
        $newXp = $totalXp % 100;

        $user->level += $levelsGained;
        $user->xp = $newXp;
        $user->save();

        // 3. Atualiza o status do envio
        $submission->status = 'approved';
        $submission->save();

        return response()->json([
            'message' => 'Missão aprovada com sucesso!',
            'user_new_level' => $user->level,
            'user_new_xp' => $user->xp
        ]);
    }
}
