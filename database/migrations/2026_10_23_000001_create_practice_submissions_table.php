<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('practice_submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assignment_id')->constrained('assignments')->cascadeOnDelete();
            $table->string('type', 20); // plan | report
            $table->decimal('grade', 4, 2)->nullable();
            $table->text('comment')->nullable();
            $table->unsignedTinyInteger('approval_status')->default(2); // 1 aprobado, 2 pendiente, 3 observado
            $table->foreignId('reviewed_by')->nullable()->constrained('assignments')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->unsignedTinyInteger('status')->default(1);
            $table->timestamps();

            $table->index(['assignment_id', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('practice_submissions');
    }
};
