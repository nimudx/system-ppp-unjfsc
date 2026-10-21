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
        Schema::create('assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users');
            $table->foreignId('role_id')->constrained('roles');
            $table->foreignId('semester_id')->constrained('semesters');
            $table->foreignId('section_id')->nullable()->constrained('sections');

            // Access of the user
            $table->unsignedTinyInteger('access_status')->default(2); // FULL -> 1 | LIMITED -> 2 | READ_ONLY -> 3 | BLOCKED -> 0

            // Academic validaty
            $table->unsignedTinyInteger('approval_status')->default(2); // APPROVED -> 1 | PENDING -> 2 | REJECTED -> 0

            // Flow administrative
            $table->unsignedTinyInteger('review_status')->default(0); // NONE | UNDER_REVIEW | OBSERVED

            // Life of the register
            $table->unsignedTinyInteger('status')->default(1); // ACTIVE | INACTIVE

            $table->boolean('is_select')->default(false);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assignments');
    }
};
