<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('resources', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();

            // Quién sube: Assignment (Admin) o Company
            $table->morphs('uploader');

            // Para quién es: Alumno, Docente, Empresa
            $table->foreignId('role_id')->nullable()->constrained('roles')->onDelete('cascade');

            // 1: Global, 2: Facultad, 3: Escuela, 4: Sección, 5: Empresa
            $table->unsignedTinyInteger('level');

            // El tipo de recurso (Manual, Plantilla, etc.)
            $table->foreignId('document_type_id')->constrained('document_types')->onDelete('cascade');

            // UBICACIÓN POLIMÓRFICA (IMPORTANTE: nullable)
            // Si level es 1 (Global), estos serán NULL.
            // Si level es 2, location_type será 'App\Models\Faculty'.
            // Si level es 3, location_type será 'App\Models\School'.
            // Si level es 4, location_type será 'App\Models\Section'.
            // Si level es 5, location_type será 'App\Models\Company'.
            $table->nullableMorphs('location');

            $table->foreignId('semester_id')->nullable()->constrained('semesters')->onDelete('cascade');
            $table->unsignedTinyInteger('status')->default(1);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('resources');
    }
};
