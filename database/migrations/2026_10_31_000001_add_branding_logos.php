<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Logo propio de cada sección (lo sube el docente titular) y ajustes generales
     * de la plataforma, como el logo por defecto que sube el administrador.
     */
    public function up(): void
    {
        Schema::table('sections', function (Blueprint $table) {
            $table->string('logo_path')->nullable()->after('name');
        });

        Schema::create('app_settings', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->text('value')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('app_settings');

        Schema::table('sections', function (Blueprint $table) {
            $table->dropColumn('logo_path');
        });
    }
};
