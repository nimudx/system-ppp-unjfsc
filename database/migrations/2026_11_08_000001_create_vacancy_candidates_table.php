<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Propuestas de candidatos hechas por el docente titular.
     */
    public function up(): void
    {
        Schema::create('vacancy_candidates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vacancy_id')->constrained('vacancies')->cascadeOnDelete();
            $table->foreignId('student_assignment_id')->constrained('assignments')->restrictOnDelete();
            $table->foreignId('proposed_by_assignment_id')->constrained('assignments')->restrictOnDelete();
            $table->string('note', 500)->nullable();
            $table->string('status', 20)->default('proposed');
            $table->string('status_note', 500)->nullable();
            $table->timestamps();

            $table->unique(['vacancy_id', 'student_assignment_id']);
            $table->index(['vacancy_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vacancy_candidates');
    }
};
