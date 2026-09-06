<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

$existing = User::where('email', 'denilson@admin.com')->first();
if (!$existing) {
    User::create([
        'name' => 'Denilson Fonseca',
        'email' => 'denilson@admin.com',
        'password' => Hash::make('blb12345'),
        'role' => 'admin',
        'unit' => null
    ]);
    echo "Conta do Denilson criada com sucesso!\n";
} else {
    echo "Conta do Denilson já existe.\n";
}
