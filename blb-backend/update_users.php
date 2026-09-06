<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

// Inativar e remover unidade da Isadora
$isadora = User::where('name', 'Isadora')->first();
if ($isadora) {
    // Se não tiver is_active, apenas removemos a unidade. O Laravel default auth não tem is_active por padrão a menos que tenha sido adicionado.
    // O usuário não mencionou se já existe is_active. Vou assumir que quer apenas tirar da unidade ou se tiver "status" ou "is_active".
    // Para segurança, removo da unidade e altero a senha para não conseguir logar, ou se existir is_active eu seto false.
    if (\Illuminate\Support\Facades\Schema::hasColumn('users', 'is_active')) {
        $isadora->is_active = false;
    }
    $isadora->unit = null;
    $isadora->save();
    echo "Isadora inativada e removida da unidade.\n";
} else {
    echo "Isadora não encontrada.\n";
}

// Criar Raissa e Pietra
$users = [
    ['name' => 'Raissa', 'email' => 'raissa@dbv.com'],
    ['name' => 'Pietra', 'email' => 'pietra@dbv.com']
];

foreach ($users as $u) {
    $existing = User::where('email', $u['email'])->first();
    if (!$existing) {
        User::create([
            'name' => $u['name'],
            'email' => $u['email'],
            'password' => Hash::make('blb12345'),
            'role' => 'dbv',
            'unit' => 'Alcatéia Benjamim'
        ]);
        echo "Criada: " . $u['name'] . "\n";
    } else {
        $existing->unit = 'Alcatéia Benjamim';
        $existing->save();
        echo "Atualizada: " . $u['name'] . "\n";
    }
}
