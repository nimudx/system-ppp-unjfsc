<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Una escuela destino no puede repetirse dentro de la misma vacante.
     */
    public function up(): void
    {
        Schema::table('vacancy_schools', function (Blueprint $table) {
            $table->unique(['vacancy_id', 'school_id']);
        });
    }

    public function down(): void
    {
        Schema::table('vacancy_schools', function (Blueprint $table) {
            $table->dropUnique(['vacancy_id', 'school_id']);
        });
    }
};
