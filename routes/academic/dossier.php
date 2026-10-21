<?php

use App\Http\Controllers\Academic\DossierController;
use Illuminate\Support\Facades\Route;

// My Dossier (Submission) - Accessible by Student, Supervisor, Teacher
Route::get('/dossier', [DossierController::class, 'SubmissionIndex'])
    ->middleware('role:3,4,5')
    ->name('dossiers.submission');

// Dossier Validation (Management) - Different roles for different lists
Route::middleware(['role:1,2,3'])->group(function () {
    // General validation lists
    Route::get('/dossiers/teacher', [DossierController::class, 'TeacherDossierIndex'])
        ->middleware('role:1,2')
        ->name('dossiers.teacher');

    Route::get('/dossiers/supervisor', [DossierController::class, 'SupervisorDossierIndex'])->name('dossiers.supervisor');
    Route::get('/dossiers/student', [DossierController::class, 'StudentDossierIndex'])->name('dossiers.student');

    // Details and API
    // Route::get('/dossiers/validation', [DossierController::class, 'indexValidation'])->name('dossiers.validation');
    Route::get('/dossiers/validation/{dossier}', [DossierController::class, 'showValidation'])->name('dossiers.validation.show');
    Route::get('/dossiers/api/validations/{assignment}', [DossierController::class, 'getDetailDossier'])->name('dossiers.api.validations');
    Route::get('/api/dossiers/filter', [DossierController::class, 'getAssignmentsByFilter'])
        ->middleware('role:1,2')
        ->name('dossiers.api.filter');

    // State changes (Evaluations)
    Route::patch('/dossiers/{document}/status', [DossierController::class, 'updateDossierStatus'])->name('dossiers.document.status');
});

// Document Upload Operations (shared or specific?)
Route::post('/dossiers/document/store', [DossierController::class, 'storeDocumentDossier'])
    ->middleware('role:3,4,5')
    ->name('dossiers.document.store');
