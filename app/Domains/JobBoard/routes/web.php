<?php

use App\Domains\JobBoard\Http\Controllers\VacancyAdminController;
use App\Domains\JobBoard\Http\Controllers\VacancyController;
use App\Domains\JobBoard\Http\Controllers\VacancyTeacherController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
 * Vitrina pública existente. No forma parte del flujo interno de la bolsa
 * laboral y se mantiene intacta.
 */
Route::get('/bolsa', function () {
    return Inertia::render('jobboard/public/index');
})->name('bolsa.index');

/*
 * Empresa: publica y gestiona sus propias vacantes.
 */
Route::prefix('empresa/bolsa')
    ->name('company.jobboard.')
    ->middleware(['auth', 'type:3'])
    ->group(function () {
        Route::get('/', [VacancyController::class, 'index'])->name('index');
        Route::get('/crear', [VacancyController::class, 'create'])->name('create');
        Route::post('/', [VacancyController::class, 'store'])
            ->middleware('throttle:10,60')
            ->name('store');

        Route::get('/{vacancy}/editar', [VacancyController::class, 'edit'])
            ->whereNumber('vacancy')
            ->name('edit');
        Route::patch('/{vacancy}', [VacancyController::class, 'update'])
            ->whereNumber('vacancy')
            ->middleware('throttle:10,60')
            ->name('update');
        Route::post('/{vacancy}/enviar', [VacancyController::class, 'submit'])
            ->whereNumber('vacancy')
            ->middleware('throttle:10,60')
            ->name('submit');
        Route::post('/{vacancy}/cerrar', [VacancyController::class, 'close'])
            ->whereNumber('vacancy')
            ->middleware('throttle:10,60')
            ->name('close');
    });

/*
 * Administración: revisa vacantes y gestiona los candidatos propuestos.
 */
Route::prefix('bolsa/administracion')
    ->name('academic.jobboard.admin.')
    ->middleware(['auth', 'type:1,2', 'approved', 'role:1,2'])
    ->group(function () {
        Route::get('/', [VacancyAdminController::class, 'index'])->name('index');
        Route::get('/{vacancy}/detalle', [VacancyAdminController::class, 'detail'])
            ->whereNumber('vacancy')
            ->name('detail');
        Route::patch('/{vacancy}/revision', [VacancyAdminController::class, 'review'])
            ->whereNumber('vacancy')
            ->name('review');
        Route::post('/{vacancy}/notificar', [VacancyAdminController::class, 'notifyTeachers'])
            ->whereNumber('vacancy')
            ->name('notify-teachers');
        Route::post('/{vacancy}/cerrar', [VacancyAdminController::class, 'close'])
            ->whereNumber('vacancy')
            ->name('close');
        Route::patch('/{vacancy}/candidatos/{candidate}', [VacancyAdminController::class, 'updateCandidate'])
            ->whereNumber('vacancy')
            ->whereNumber('candidate')
            ->name('candidates.update');
    });

/*
 * Docente titular: propone estudiantes de su sección y retira propuestas.
 */
Route::prefix('bolsa/vacantes')
    ->name('academic.jobboard.teacher.')
    ->middleware(['auth', 'type:1,2', 'approved', 'role:3'])
    ->group(function () {
        Route::get('/', [VacancyTeacherController::class, 'index'])->name('index');
        Route::get('/{vacancy}/detalle', [VacancyTeacherController::class, 'detail'])
            ->whereNumber('vacancy')
            ->name('detail');
        Route::post('/{vacancy}/propuestas', [VacancyTeacherController::class, 'propose'])
            ->whereNumber('vacancy')
            ->name('propose');
        Route::delete('/{vacancy}/propuestas/{candidate}', [VacancyTeacherController::class, 'withdraw'])
            ->whereNumber('vacancy')
            ->whereNumber('candidate')
            ->name('withdraw');
    });
