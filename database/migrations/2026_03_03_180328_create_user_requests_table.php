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
        Schema::create('user_requests', function (Blueprint $table) {
            $table->id();
            $table->morphs('senderable');

            $table->morphs('requestable');

            $table->foreignId('reviewed_by')->nullable()->constrained('assignments')->onDelete('set null');

            $table->string('type');
            $table->text('reason');
            $table->text('justification')->nullable();

            $table->json('payload');

            $table->unsignedTinyInteger('approval_status')->default(2); // Controla el estado de la solicitud
            $table->unsignedTinyInteger('status')->default(1); // Controla el estado del registro
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('requests');
    }
};
