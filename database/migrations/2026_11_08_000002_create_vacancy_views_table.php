<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Vistas por usuario para calcular la etiqueta "Nuevo".
     */
    public function up(): void
    {
        Schema::create('vacancy_views', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vacancy_id')->constrained('vacancies')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamp('seen_at');
            $table->timestamps();

            $table->unique(['vacancy_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vacancy_views');
    }
};
