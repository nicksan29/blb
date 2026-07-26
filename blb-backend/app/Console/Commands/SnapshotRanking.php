<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\RankingHistory;
use Carbon\Carbon;

class SnapshotRanking extends Command
{
    // O comando que você vai digitar no terminal para rodar isso
    protected $signature = 'ranking:snapshot';

    protected $description = 'Salva o estado atual (snapshot) do ranking de todos os desbravadores';

    public function handle()
    {
        $this->info('Iniciando o fechamento do ranking da semana...');

        // Busca os desbravadores ordenados (Critério principal do escopo)
        $dbvs = User::where('role', 'dbv')
                    ->orderBy('level', 'desc')
                    ->orderBy('xp', 'desc')
                    ->get();

        $today = Carbon::now()->toDateString();
        $position = 1;

        foreach ($dbvs as $dbv) {
            RankingHistory::create([
                'user_id' => $dbv->id,
                'level' => $dbv->level,
                'xp' => $dbv->xp,
                'betelcoins' => $dbv->betelcoins,
                'rank_position' => $position,
                'week_date' => $today,
            ]);
            $position++;
        }

        $this->info('Snapshot gerado com sucesso! Tabela salva imutável no banco de dados.');
    }
}
