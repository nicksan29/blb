<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Criando a conta da Diretoria
        User::create([
            'name' => 'Diretoria BLB',
            'email' => 'admin@blb.com',
            'password' => Hash::make('senha123'), // Mude depois!
            'role' => 'admin',
            'level' => 99,
        ]);

        // 2. Lista de Desbravadores (Tabela Oficial)
        $dbvs = [
            ['name' => 'César', 'level' => 13, 'xp' => 45, 'betelcoins' => 918],
            ['name' => 'Davi Juaz', 'level' => 12, 'xp' => 57, 'betelcoins' => 868],
            ['name' => 'Lorena Vilela', 'level' => 11, 'xp' => 42, 'betelcoins' => 610],
            ['name' => 'Maria Eduarda', 'level' => 10, 'xp' => 40, 'betelcoins' => 665],
            ['name' => 'Daniel Michelan', 'level' => 9, 'xp' => 5, 'betelcoins' => 411],
            ['name' => 'Lorena Mariano', 'level' => 8, 'xp' => 36, 'betelcoins' => 465],
            ['name' => 'Miguel Michelan', 'level' => 7, 'xp' => 98, 'betelcoins' => 445],
            ['name' => 'Hugo', 'level' => 7, 'xp' => 90, 'betelcoins' => 441],
            ['name' => 'Rony', 'level' => 7, 'xp' => 40, 'betelcoins' => 565],
            ['name' => 'Miguel Oliveira', 'level' => 5, 'xp' => 15, 'betelcoins' => 325],
            ['name' => 'Felipe Michelan', 'level' => 4, 'xp' => 95, 'betelcoins' => 318],
            ['name' => 'Tati', 'level' => 4, 'xp' => 45, 'betelcoins' => 200],
            ['name' => 'Ana Laura', 'level' => 2, 'xp' => 90, 'betelcoins' => 130],
            ['name' => 'Helena', 'level' => 2, 'xp' => 20, 'betelcoins' => 85],
            ['name' => 'Enzo', 'level' => 1, 'xp' => 10, 'betelcoins' => 60],
            ['name' => 'Yago Malta', 'level' => 1, 'xp' => 10, 'betelcoins' => 40],
            ['name' => 'Rafaela', 'level' => 0, 'xp' => 40, 'betelcoins' => 25],
        ];

        // 3. Cadastrando os DBVs
        foreach ($dbvs as $dbv) {
            // Agora pega o nome completo e transforma em formato de email (ex: lorena-vilela)
            $emailPrefix = Str::slug($dbv['name']);

            User::create([
                'name' => $dbv['name'],
                'email' => $emailPrefix . '@blb.com',
                'password' => Hash::make('dbv2026'),
                'role' => 'dbv',
                'level' => $dbv['level'],
                'xp' => $dbv['xp'],
                'betelcoins' => $dbv['betelcoins'],
            ]);
        }
    }
}
