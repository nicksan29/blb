<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class ProfileController extends Controller
{
    // ==========================================
    // ROTA COMUM (O próprio usuário troca a senha)
    // ==========================================
    public function changePassword(Request $request)
    {
        $request->validate([
            'new_password' => 'required|min:6'
        ]);

        $user = $request->user();
        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json(['message' => 'Sua senha foi atualizada com sucesso!']);
    }

    // ==========================================
    // ROTAS DA DIRETORIA (Admin)
    // ==========================================

    // Lista todos os usuários do sistema
    public function indexUsers()
    {
        return response()->json(User::orderBy('name', 'asc')->get(['id', 'name', 'email', 'role', 'level', 'xp', 'betelcoins']));
    }

    // Admin força a troca de senha de alguém
    public function adminChangeUserPassword(Request $request, $id)
    {
        $request->validate([
            'new_password' => 'required|min:6'
        ]);

        $user = User::findOrFail($id);
        $user->password = Hash::make($request->new_password);
        $user->save();

        // Opcional: Derrubar o token do usuário para forçar ele a logar com a senha nova
        $user->tokens()->delete();

        return response()->json(['message' => "A senha de {$user->name} foi alterada com sucesso!"]);
    }

    // Admin edita nível, xp e btlcs
    public function adminUpdatePoints(Request $request, $id)
    {
        if ($request->user()->email === 'denilson@admin.com') {
            return response()->json(['message' => 'Você não tem permissão para alterar pontos manualmente.'], 403);
        }
        $request->validate([
            'level' => 'required|integer|min:0',
            'xp' => 'required|integer|min:0',
            'betelcoins' => 'required|integer|min:0',
        ]);

        $user = User::findOrFail($id);
        $user->level = $request->level;
        $user->xp = $request->xp;
        $user->betelcoins = $request->betelcoins;
        $user->save();

        return response()->json(['message' => "Pontuação de {$user->name} atualizada com sucesso!"]);
    }
}
