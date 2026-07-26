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
        return response()->json(User::orderBy('name', 'asc')->get(['id', 'name', 'email', 'role']));
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
}
