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
        // 1. Hacer role_id nullable en resources
        Schema::table('resources', function (Blueprint $table) {
            $table->foreignId('role_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('resources', function (Blueprint $table) {
            $table->foreignId('role_id')->nullable(false)->change();
        });

        // No eliminamos el tipo de documento por seguridad de integridad referencial
    }
};
