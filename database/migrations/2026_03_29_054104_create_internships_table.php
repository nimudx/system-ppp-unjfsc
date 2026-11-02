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
        Schema::create('internships', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assignment_id')->constrained('assignments')->cascadeOnDelete();
            $table->foreignId('placement_id')->constrained('placements')->cascadeOnDelete();

            $table->unsignedTinyInteger('internship_step')->default(1);

            $table->integer('grade')->nullable();
            $table->string('comment')->nullable();

            $table->unsignedTinyInteger('validation_status')->default(2);
            $table->unsignedTinyInteger('application_status')->default(0);
            $table->unsignedTinyInteger('status')->default(1);
            $table->timestamps();
        });
    }

    /**
     * Revertir la migración.
     */
    public function down(): void
    {
        //
    }
};
