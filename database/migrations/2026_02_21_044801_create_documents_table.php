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
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->morphs('documentable');

            $table->string('name');
            $table->foreignId('document_type_id')->constrained('document_types');
            $table->string('path');
            $table->text('comment');

            // Seguimiento
            $table->foreignId('uploaded_by')->constrained('assignments')->onDelete('cascade');
            $table->foreignId('reviewed_by')->nullable()->constrained('assignments')->onDelete('cascade');
            $table->unsignedTinyInteger('approval_status')->default(2);
            $table->unsignedTinyInteger('status')->default(1);
            $table->timestamps();
        });
    }

    /**
     * Revertir la migración.
     */
    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
