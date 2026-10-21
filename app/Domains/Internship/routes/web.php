<?php

use App\Domains\Internship\Http\Controllers\InternshipController;
use App\Domains\Internship\Http\Controllers\InternshipSettingController;
use App\Domains\Internship\Http\Controllers\PlacementController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'type:1,2', 'approved'])->name('academic.')->group(function () {
    Route::middleware(['role:1,5'])->group(function () {
        Route::get('/internship', [InternshipController::class, 'SubmissionIndex'])->middleware(['role:5'])->name('internship.submission');

        // Placement: formalización previa al Internship
        Route::post('/internship/placements', [PlacementController::class, 'store'])->name('internship.placements.store');

        // Estudiante: Actualizar formalización (Data y Archivos independientes)
        Route::patch('/internship/placements/{placement}', [PlacementController::class, 'update'])->name('internship.placements.update');
        Route::post('/internship/placements/{placement}/documents', [PlacementController::class, 'storeDocument'])->name('internship.placements.documents.store');

        // API: Verificar empresa por RUC (devuelve datos + áreas)
        Route::get('/api/internship/companies/verify/{ruc}', [PlacementController::class, 'verifyCompany'])->name('internship.api.company.verify');

        Route::post('/internship/documents/{document}', [InternshipController::class, 'storeDocumentInternship'])->name('internship.documents.store');
    });

    Route::middleware(['role:1,2,3'])->group(function () {
        Route::get('/internship/validation', [InternshipController::class, 'ValidationIndex'])->name('internship.validation');
        Route::get('/api/internship/validation/filter', [InternshipController::class, 'getAssignmentsByFilter'])->name('internship.api.validation.filter');
        Route::get('/api/internship/validation/{assignment}', [InternshipController::class, 'getDetailPlacement'])->name('internship.api.validation');

        // Validación de Formalización (Data)
        Route::patch('/internship/placements/{placement}/status', [PlacementController::class, 'updateStatus'])->name('internship.placements.status');

        // Validación de Documentos (Files)
        Route::patch('/internship/documents/{document}/status', [InternshipController::class, 'updateInternshipStatus'])->name('internship.documents.status');

        // Calificación Final de Prácticas
        Route::patch('/internship/{internship}/grade', [InternshipController::class, 'updateGrade'])->name('internship.grade');
        Route::post('/internship/{internship}/grade-change-request', [InternshipController::class, 'storeRequestGradeChangeInternship'])->name('internship.grade-change-request');
    });

    Route::middleware(['role:1,2,3'])->group(function () {
        Route::get('/internship/settings', [InternshipSettingController::class, 'index'])->name('internship.settings');
        Route::put('/internship/settings', [InternshipSettingController::class, 'update'])->name('internship.settings.update');
    });
});

Route::middleware(['auth', 'type:1,2', 'approved', 'role:1,2,3'])
    ->name('settings.academic.')
    ->prefix('settings')
    ->group(function () {
        Route::get('internship', [InternshipSettingController::class, 'index'])->name('internship');
    });
