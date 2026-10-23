<?php

use App\Domains\Internship\Http\Controllers\InternshipController;
use App\Domains\Internship\Http\Controllers\InternshipSettingController;
use App\Domains\Internship\Http\Controllers\PlacementController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'type:1,2', 'approved'])
    ->name('academic.')
    ->group(function () {

        // Estudiante: presentación y formalización de prácticas
        Route::middleware(['role:1,5'])->group(function () {

            Route::get('/internship', [InternshipController::class, 'SubmissionIndex'])
                ->middleware(['role:5'])
                ->name('internship.submission');

            // Estudiante: revisión del informe
            Route::get('/internship/report-review', [InternshipController::class, 'ReportReviewIndex'])
                ->middleware(['role:5'])
                ->name('internship.report-review');

            // Placement: formalización previa al Internship
            Route::post('/internship/placements', [PlacementController::class, 'store'])
                ->name('internship.placements.store');

            // Estudiante: actualizar formalización
            Route::patch('/internship/placements/{placement}', [PlacementController::class, 'update'])
                ->name('internship.placements.update');

            Route::post('/internship/placements/{placement}/documents', [PlacementController::class, 'storeDocument'])
                ->name('internship.placements.documents.store');

            // API: verificar empresa por RUC
            Route::get('/api/internship/companies/verify/{ruc}', [PlacementController::class, 'verifyCompany'])
                ->name('internship.api.company.verify');

            // Enviar documentos de prácticas
            Route::post('/internship/documents/{document}', [InternshipController::class, 'storeDocumentInternship'])
                ->name('internship.documents.store');
        });

        // Docente supervisor: consulta de planes e informes
        Route::middleware(['role:4'])->group(function () {

            Route::get('/internship/practice-plans', [InternshipController::class, 'PracticePlansIndex'])
                ->name('internship.practice-plans');

            Route::get('/internship/practice-reports', [InternshipController::class, 'PracticeReportsIndex'])
                ->name('internship.practice-reports');
        });

        // Validación y calificación de prácticas
        Route::middleware(['role:1,2,3'])->group(function () {

            Route::get('/internship/validation', [InternshipController::class, 'ValidationIndex'])
                ->name('internship.validation');

            Route::get('/api/internship/validation/filter', [InternshipController::class, 'getAssignmentsByFilter'])
                ->name('internship.api.validation.filter');

            Route::get('/api/internship/validation/{assignment}', [InternshipController::class, 'getDetailPlacement'])
                ->name('internship.api.validation');

            // Validación de formalización
            Route::patch('/internship/placements/{placement}/status', [PlacementController::class, 'updateStatus'])
                ->name('internship.placements.status');

            // Validación de documentos
            Route::patch('/internship/documents/{document}/status', [InternshipController::class, 'updateInternshipStatus'])
                ->name('internship.documents.status');

            // Calificación final de prácticas
            Route::patch('/internship/{internship}/grade', [InternshipController::class, 'updateGrade'])
                ->name('internship.grade');

            Route::post('/internship/{internship}/grade-change-request', [InternshipController::class, 'storeRequestGradeChangeInternship'])
                ->name('internship.grade-change-request');
        });

        // Configuración de prácticas
        Route::middleware(['role:1,2,3'])->group(function () {

            Route::get('/internship/settings', [InternshipSettingController::class, 'index'])
                ->name('internship.settings');

            Route::put('/internship/settings', [InternshipSettingController::class, 'update'])
                ->name('internship.settings.update');
        });
    });

// Configuración académica
Route::middleware(['auth', 'type:1,2', 'approved', 'role:1,2,3'])
    ->name('settings.academic.')
    ->prefix('settings')
    ->group(function () {

        Route::get('internship', [InternshipSettingController::class, 'index'])
            ->name('internship');
    });