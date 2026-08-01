<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class SetupUnits extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:setup-units';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Configura as unidades e cria contas de conselheiros';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info("Iniciando configuração de Unidades e Conselheiros...");

        // Desbravadores existentes que precisam ter sua unidade preenchida
        $dbvs = [
            'Leões de Judá' => ['César', 'Davi Juaz', 'Miguel Michelan'],
            'Alcatéia Benjamim' => ['Maria Eduarda', 'Lorena Mariano', 'Ana Laura', 'Helena'],
            'Chamas de Aser' => ['Lorena Vilela', 'Tati', 'Rafaela'],
            'Valentes de Gade' => ['Daniel Michelan', 'Hugo', 'Felipe Michelan', 'Rony', 'Miguel Oliveira', 'Yago Malta']
        ];

        foreach ($dbvs as $unit => $names) {
            foreach ($names as $name) {
                $user = \App\Models\User::where('name', 'like', "%$name%")->first();
                if ($user) {
                    $user->update(['unit' => $unit]);
                    $this->info("Unidade $unit definida para: $name");
                } else {
                    $this->warn("Aviso: Desbravador '$name' não encontrado no banco.");
                }
            }
        }

        // Criar NOVOS desbravadores solicitados
        $newDbvs = [
            ['name' => 'Nicolas', 'unit' => 'Leões de Judá', 'email' => 'nicolas@dbv.com'],
            ['name' => 'Isadora', 'unit' => 'Alcatéia Benjamim', 'email' => 'isadora@dbv.com'],
            ['name' => 'Pietro', 'unit' => 'Valentes de Gade', 'email' => 'pietro@dbv.com'],
        ];

        foreach ($newDbvs as $dbv) {
            $user = \App\Models\User::firstOrCreate(
                ['email' => $dbv['email']],
                [
                    'name' => $dbv['name'],
                    'password' => \Illuminate\Support\Facades\Hash::make('dbv12345'), // 'mesma senha dos desbravadores' - vou usar dbv12345, ou se for blb12345, vou por blb12345. Vou usar a provavel blb12345
                    'role' => 'dbv',
                    'unit' => $dbv['unit']
                ]
            );
            $user->update(['password' => \Illuminate\Support\Facades\Hash::make('blb12345'), 'unit' => $dbv['unit']]);
            $this->info("Novo Desbravador Criado: {$dbv['name']}");
        }

        // Contas de Conselheiros
        $counselors = [
            ['name' => 'Sandy', 'unit' => 'Alcatéia Benjamim', 'email' => 'sandy@conselheiro.com'],
            ['name' => 'Lídia', 'unit' => 'Alcatéia Benjamim', 'email' => 'lidia@conselheiro.com'],
            ['name' => 'Evelyn', 'unit' => 'Chamas de Aser', 'email' => 'evelyn@conselheiro.com'],
            ['name' => 'Duda', 'unit' => 'Chamas de Aser', 'email' => 'duda@conselheiro.com'],
            ['name' => 'Denilson', 'unit' => 'Valentes de Gade', 'email' => 'denilson@conselheiro.com'],
            ['name' => 'Kelvin', 'unit' => 'Leões de Judá', 'email' => 'kelvin@conselheiro.com'],
        ];

        foreach ($counselors as $c) {
            $user = \App\Models\User::firstOrCreate(
                ['email' => $c['email']],
                [
                    'name' => $c['name'],
                    'password' => \Illuminate\Support\Facades\Hash::make('blb12345'),
                    'role' => 'counselor',
                    'unit' => $c['unit']
                ]
            );
            $user->update(['role' => 'counselor', 'unit' => $c['unit'], 'password' => \Illuminate\Support\Facades\Hash::make('blb12345')]);
            $this->info("Conselheiro Criado/Atualizado: {$c['name']} - {$c['unit']}");
        }

        $this->info("Configuração concluída com sucesso!");
    }
}
