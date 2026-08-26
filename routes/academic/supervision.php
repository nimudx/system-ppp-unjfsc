<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Academic\SupervisionController;

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
