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
        Schema::create('placements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assignment_id')->constrained('assignments')->cascadeOnDelete();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->foreignId('staff_id')->nullable()->constrained('staffs')->cascadeOnDelete();
            $table->foreignId('area_id')->nullable()->constrained('areas')->cascadeOnDelete();

            $table->string('boss_name')->nullable();
            $table->string('boss_position')->nullable();
            $table->string('boss_phone')->nullable();
            $table->string('boss_email')->nullable();

            $table->string('position');
            $table->string('description')->nullable();

            $table->date('start_date');
            $table->date('end_date');

            $table->string('internship_type')->default('desarrollo');
            $table->string('origin_type')->default('direct');

            $table->text('observation')->nullable();

            $table->unsignedTinyInteger('approval_status')->default(2);
            $table->unsignedTinyInteger('validation_status')->default(2);
            $table->unsignedTinyInteger('status')->default(1);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
