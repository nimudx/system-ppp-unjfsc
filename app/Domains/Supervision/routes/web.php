<?php

use App\Domains\Supervision\Http\Controllers\InternshipGroupController;
use App\Domains\Supervision\Http\Controllers\SupervisionController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'type:1,2', 'approved'])->name('academic.')->group(function () {
    Route::middleware(['auth', 'role:1,2,3'])->group(function () {
        // List views
        Route::get('/groups/internship', [InternshipGroupController::class, 'indexByInternship'])->name('groups.internship');
        Route::get('/groups/student', [InternshipGroupController::class, 'indexByStudent'])->name('groups.student');

        // API Dependencies
        Route::get('/groups/api/sections/{section}/dependencies', [InternshipGroupController::class, 'getDependencies'])->name('groups.api.dependencies');
        Route::get('/groups/api/sections/{section}/students', [InternshipGroupController::class, 'getStudents'])->name('groups.api.students');
        Route::get('/groups/api/groups/{group}/students', [InternshipGroupController::class, 'getGroupStudents'])->name('groups.api.group_students');
        // Filter APIs (for Admin roles)
        Route::get('/api/groups/internship/filter', [InternshipGroupController::class, 'getGroupsByFilter'])->name('groups.api.internship.filter');
        Route::get('/api/groups/student/filter', [InternshipGroupController::class, 'getStudentsByFilter'])->name('groups.api.student.filter');

        // Operations
        Route::post('/groups', [InternshipGroupController::class, 'store'])->name('groups.store');
        Route::delete('/groups/{group}', [InternshipGroupController::class, 'delete'])->name('groups.delete');
        Route::put('/groups/{group}', [InternshipGroupController::class, 'update'])->name('groups.update');
        Route::post('/groups/{group}/attach', [InternshipGroupController::class, 'attachStudents'])->name('groups.attach');
        Route::post('/groups/{group}/detach', [InternshipGroupController::class, 'detachStudents'])->name('groups.detach');
        Route::post('/groups/{group}/move', [InternshipGroupController::class, 'moveStudents'])->name('groups.move');
    });

    Route::middleware(['auth', 'role:4'])->group(function () {
        // List views
        Route::get('/groups/supervision', [InternshipGroupController::class, 'indexBySupervision'])->name('groups.supervision');
        Route::get('/groups/api/supervision/{group}/students', [InternshipGroupController::class, 'getGroupStudentsDetails'])->name('groups.api.supervision_students');
    });

    Route::middleware(['role:1,2,3,4'])->group(function () {
        Route::get('supervision/submission', [SupervisionController::class, 'submissionIndex'])->name('supervision.submission');
        Route::post('supervision/assignments/{assignment}/evaluation', [SupervisionController::class, 'storeEvaluation'])->name('supervision.store');
    });

    Route::middleware(['role:1,2,3'])->group(function () {
        Route::get('supervision/validation', [SupervisionController::class, 'validationIndex'])->name('supervision.validation');
        Route::get('supervision/api/students/search', [SupervisionController::class, 'searchStudents'])->name('supervision.api.students_search');
        Route::get('supervision/api/groups', [SupervisionController::class, 'getGroupsByFilter'])->name('supervision.api.groups');
        Route::get('supervision/api/groups/{group}/students/filter', [SupervisionController::class, 'getStudentsByFilter'])->name('supervision.api.group_students_filter');
        Route::get('supervision/api/assignments/{assignment}/annexes', [SupervisionController::class, 'getSupervisionAnnexes'])->name('supervision.api.annexes');

        Route::patch('evaluations/{evaluation}/status', [SupervisionController::class, 'updateEvaluationStatus'])->name('supervision.update');
    });

    Route::middleware(['role:5'])->group(function () {
        Route::get('supervision/student', [SupervisionController::class, 'studentIndex'])->name('supervision.student');
    });
});
