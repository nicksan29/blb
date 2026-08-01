<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Alterar o ENUM para suportar 'counselor'
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'dbv', 'counselor') NOT NULL DEFAULT 'dbv'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reverter (isso pode dar erro se já houver counselor)
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'dbv') NOT NULL DEFAULT 'dbv'");
    }
};
