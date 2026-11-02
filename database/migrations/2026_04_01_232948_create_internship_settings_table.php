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
        Schema::create('internship_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('section_id')->unique()->constrained()->onDelete('cascade');
            $table->json('workflow_schema');
            $table->boolean('is_active')->default(false);
            $table->unsignedTinyInteger('status')->default(1); // 1: Draft, 2: Active, 3: Completed
            $table->timestamps();
        });
    }

    /**
     * Revertir la migración.
     */
    public function down(): void
    {
        Schema::dropIfExists('internship_settings');
    }
};
