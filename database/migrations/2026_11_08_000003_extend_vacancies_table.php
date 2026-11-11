<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Diferencial del módulo JobBoard sobre la tabla heredada.
     *
     * No se renombra ninguna columna existente: solo se relajan las columnas
     * heredadas que ya no aplican al flujo de vacantes y se agregan las nuevas.
     */
    public function up(): void
    {
        Schema::table('vacancies', function (Blueprint $table) {
            // Columnas heredadas que ahora son opcionales.
            $table->unsignedBigInteger('staff_id')->nullable()->change();
            $table->date('start_date')->nullable()->change();
            $table->date('end_date')->nullable()->change();

            // El estado pasa de tinyint a enum respaldado por texto.
            $table->string('status', 20)->default('draft')->change();
            $table->text('description')->nullable()->change();

            $table->foreignId('semester_id')->nullable()->constrained('semesters')->nullOnDelete();
            $table->string('type', 20)->default('empleo');
            $table->string('modality', 20)->default('presencial');
            $table->string('area_name')->nullable();
            $table->string('location')->nullable();
            $table->unsignedSmallInteger('positions_count')->default(1);
            $table->text('requirements')->nullable();
            $table->timestamp('deadline_at')->nullable();
            $table->text('review_comment')->nullable();
            $table->foreignId('reviewed_by_assignment_id')->nullable()->constrained('assignments')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamp('closed_at')->nullable();
            $table->string('closed_reason', 20)->nullable();

            $table->index(['status', 'semester_id']);
            $table->index(['company_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::table('vacancies', function (Blueprint $table) {
            $table->dropIndex(['status', 'semester_id']);
            $table->dropIndex(['company_id', 'status']);

            $table->dropConstrainedForeignId('semester_id');
            $table->dropConstrainedForeignId('reviewed_by_assignment_id');

            $table->dropColumn([
                'type',
                'modality',
                'area_name',
                'location',
                'positions_count',
                'requirements',
                'deadline_at',
                'review_comment',
                'reviewed_at',
                'published_at',
                'closed_at',
                'closed_reason',
            ]);
        });
    }
};
