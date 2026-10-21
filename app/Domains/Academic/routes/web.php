<?php

use App\Domains\Academic\Http\Controllers\FacultyController;
use App\Domains\Academic\Http\Controllers\SchoolController;
use App\Domains\Academic\Http\Controllers\SectionController;
use App\Domains\Academic\Http\Controllers\SemesterController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'type:1,2', 'approved'])->name('academic.')->group(function () {
    Route::middleware(['role:1,2,3'])->group(function () {
        Route::get('/semesters', [SemesterController::class, 'index'])->name('semesters.index');
        Route::patch('/semesters/{semester}', [SemesterController::class, 'update'])->name('semesters.update');
        Route::post('/semesters/{semester}/close', [SemesterController::class, 'closeCurrentSemester'])->name('semesters.close');
        Route::post('/semesters/{semester}/back', [SemesterController::class, 'backCurrentSemester'])->name('semesters.back');

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

});
