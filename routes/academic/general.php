<?php

use App\Http\Controllers\Academic\FacultyController;
use App\Http\Controllers\Academic\SchoolController;
use App\Http\Controllers\Academic\SectionController;
use App\Http\Controllers\Academic\SemesterController;
use App\Http\Controllers\UserAssignmentController;
use Illuminate\Support\Facades\Route;

Route::middleware(['role:1,2,3'])->group(function () {
    Route::get('/semesters', [SemesterController::class, 'index'])->name('semesters.index');
    Route::patch('/semesters/{semester}', [SemesterController::class, 'update'])->name('semesters.update');
    Route::post('/semesters/{semester}/close', [SemesterController::class, 'closeCurrentSemester'])->name('semesters.close');
    Route::post('/semesters/{semester}/back', [SemesterController::class, 'backCurrentSemester'])->name('semesters.back');

    // Filtrado de Usuarios (Estilo Dossier)
    Route::get('/users/filter', [UserAssignmentController::class, 'getAssignmentsByFilter'])->name('users.filter');
});

Route::middleware(['role:1,2,4'])->group(function () {
    Route::get('/faculties', [FacultyController::class, 'index'])->name('faculties.index');
    Route::post('/faculties', [FacultyController::class, 'store'])->name('faculties.store');
    Route::patch('/faculties/{faculty}', [FacultyController::class, 'update'])->name('faculties.update');
    Route::delete('/faculties/{faculty}', [FacultyController::class, 'destroy'])->name('faculties.destroy');
});

Route::middleware(['role:1,2'])->group(function () {
    // Schools
    Route::get('/schools', [SchoolController::class, 'index'])->name('schools.index');
    Route::post('/faculties/{faculty}/schools', [SchoolController::class, 'store'])->name('schools.store');
    Route::patch('/faculties/{faculty}/schools/{school}', [SchoolController::class, 'update'])->name('schools.update');
    Route::delete('/schools/{school}', [SchoolController::class, 'destroy'])->name('schools.destroy');
});

Route::middleware(['role:1,2'])->group(function () {
    // Sections
    Route::get('/sections', [SectionController::class, 'index'])->name('sections.index');
    Route::post('/schools/{school}/sections', [SectionController::class, 'store'])->name('sections.store');
    Route::delete('/sections/{section}', [SectionController::class, 'destroy'])->name('sections.destroy');
});

Route::get('/teachers', [UserAssignmentController::class, 'listTeachers'])->middleware('role:1,2')->name('teachers.index');

Route::middleware(['role:1,2,3'])->group(function () {
    // Gestión de Usuarios por Rol
    Route::get('/supervisors', [UserAssignmentController::class, 'listSupervisors'])->name('supervisors.index');
    Route::get('/students', [UserAssignmentController::class, 'listStudents'])->name('students.index');

    // Gestión de Asignaciones
    Route::post('/assignments/{assignment}/manage', [UserAssignmentController::class, 'storeAssignmentManage'])->name('assignments.manage');
});

// Ruta exclusiva para Administrador de Sistema
Route::get('/subadmins', [UserAssignmentController::class, 'listSubAdmins'])->middleware('role:1')->name('subadmins.index');

// API para Gestión de Asignaciones (Pedidos de Cambio/Baja)
Route::middleware(['role:1,2,3'])->group(function () {
    Route::get('/assignments/api/requests/{assignment}', [UserAssignmentController::class, 'getAssignmentRequest'])->name('assignments.api.requests.get');
    Route::patch('/assignments/api/requests/{userRequest}/status', [UserAssignmentController::class, 'updateAssignmentRequestStatus'])->name('assignments.api.requests.status');
});
