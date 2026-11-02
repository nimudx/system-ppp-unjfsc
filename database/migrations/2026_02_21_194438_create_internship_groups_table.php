<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Ejecutar la migración.
     */
    public function up(): void
    {
        Schema::create('internship_groups', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->foreignId('teacher_assignment_id')->constrained('assignments');
            $table->foreignId('supervisor_assignment_id')->constrained('assignments');
            $table->foreignId('section_id')->constrained('sections');
            $table->foreignId('module_id')->constrained('modules');
            $table->unsignedTinyInteger('status')->default(1);
            $table->timestamps();
        });
    }

    /**
     * Revertir la migración.
     */
    public function down(): void
    {
        Schema::dropIfExists('internship_groups');
    }
};
