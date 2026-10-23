<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::table('companies')->select('ruc')->groupBy('ruc')->havingRaw('COUNT(*) > 1')->exists()) {
            throw new RuntimeException('Existen RUC duplicados en companies. Corregirlos antes de ejecutar esta migración; no se fusionan registros automáticamente.');
        }
        Schema::table('users', function (Blueprint $table) {
            // Una cuenta de empresa representa a la organización, sin inventar un DNI.
            $table->foreignId('person_id')->nullable()->change();
        });
        Schema::table('companies', function (Blueprint $table) {
            $table->unique('ruc');
            $table->foreignId('account_user_id')->nullable()->unique()->constrained('users')->restrictOnDelete();
            $table->string('representative_name')->nullable();
            $table->string('representative_phone', 30)->nullable();
            $table->timestamp('activated_at')->nullable();
            $table->foreignId('approved_by_assignment_id')->nullable()->constrained('assignments')->restrictOnDelete();
            $table->timestamp('approved_at')->nullable();
        });
        Schema::create('company_validation_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assignment_id')->unique()->constrained('assignments')->restrictOnDelete();
            $table->foreignId('school_id')->constrained('schools')->restrictOnDelete();
            $table->foreignId('semester_id')->constrained('semesters')->restrictOnDelete();
            $table->foreignId('company_id')->nullable()->constrained('companies')->restrictOnDelete();
            $table->string('ruc', 11)->index();
            $table->json('company_data');
            $table->boolean('is_new_company');
            $table->string('state', 30)->index();
            $table->string('ruc_document_path')->nullable();
            $table->text('declaration_text');
            $table->string('declaration_version', 30);
            $table->timestamp('declared_at');
            $table->foreignId('reviewed_by_assignment_id')->nullable()->constrained('assignments')->restrictOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->text('review_comment')->nullable();
            $table->timestamp('company_decided_at')->nullable();
            $table->text('company_comment')->nullable();
            $table->timestamp('last_invited_at')->nullable();
            $table->timestamps();
            $table->index(['school_id', 'semester_id', 'state'], 'company_requests_academic_state');
        });
        Schema::create('company_validation_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_validation_request_id')->constrained()->cascadeOnDelete();
            $table->foreignId('actor_user_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('actor_assignment_id')->nullable()->constrained('assignments')->restrictOnDelete();
            $table->string('action', 40);
            $table->string('from_state', 30)->nullable();
            $table->string('to_state', 30);
            $table->text('comment')->nullable();
            $table->json('snapshot')->nullable();
            $table->timestamps();
        });
        Schema::create('company_invitations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_validation_request_id')->constrained()->cascadeOnDelete();
            $table->foreignId('company_id')->constrained()->restrictOnDelete();
            $table->string('email');
            $table->string('token_hash', 64)->unique();
            $table->timestamp('expires_at');
            $table->timestamp('consumed_at')->nullable();
            $table->timestamp('revoked_at')->nullable();
            $table->timestamps();
        });
        Schema::table('placements', function (Blueprint $table) {
            $table->foreignId('company_validation_request_id')->nullable()->constrained()->restrictOnDelete();
            $table->timestamp('practice_declared_at')->nullable();
            $table->text('practice_declaration_text')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('placements', function (Blueprint $table) {
            $table->dropConstrainedForeignId('company_validation_request_id');
            $table->dropColumn(['practice_declared_at', 'practice_declaration_text']);
        });
        Schema::dropIfExists('company_invitations');
        Schema::dropIfExists('company_validation_events');
        Schema::dropIfExists('company_validation_requests');
        Schema::table('companies', function (Blueprint $table) {
            $table->dropUnique(['account_user_id']);
            $table->dropConstrainedForeignId('account_user_id');
            $table->dropConstrainedForeignId('approved_by_assignment_id');
            $table->dropUnique(['ruc']);
            $table->dropColumn(['representative_name', 'representative_phone', 'activated_at', 'approved_at']);
        });
        // person_id permanece nullable: no invalidar cuentas de empresa ya creadas.
    }
};
