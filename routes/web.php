<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('landing', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::get('/registro-empresa', function () {
    return Inertia::render('company/register');
})->name('empresa.registro');

Route::get('dashboard', function () {
    return Inertia::render('dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

use App\Http\Controllers\AcademicSessionController;
use App\Http\Controllers\NotificationController;

Route::middleware(['auth'])->group(function () {
    Route::patch('semesters/{semester}/select', [AcademicSessionController::class, 'syncSemester'])->name('semesters.select');
    Route::patch('assignments/{assignment}/select', [AcademicSessionController::class, 'syncAssignment'])->name('assignments.select');
    Route::patch('staffs/{staff}/select', [AcademicSessionController::class, 'syncStaff'])->name('staffs.select');
    Route::patch('notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::patch('notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.markAllAsRead');
    Route::delete('notifications/{id}', [NotificationController::class, 'destroy'])->name('notifications.destroy');
});

Route::middleware(['auth'])->group(function () {
    Route::get('notifications', [NotificationController::class, 'index'])->name('notifications.index');
});

// /semesters/${id}/select

// Rutas para el área Académica
Route::middleware(['auth', 'type:1,2', 'approved'])
    //->prefix('academic')
    ->name('academic.')
    ->group(function () {
        require __DIR__ . '/academic/general.php';
        require __DIR__ . '/academic/dossier.php';
        require __DIR__ . '/academic/groups.php';
        require __DIR__ . '/academic/supervision.php';
        require __DIR__ . '/academic/internship.php';
    });

// Rutas para el área de Empresas (placeholder para cuando las crees)
Route::middleware(['auth', 'type:1,3'])
    ->prefix('company')
    ->name('company.')
    ->group(function () {
        require __DIR__ . '/company/general.php';
    });

// Rutas compartidas o de configuración
require __DIR__ . '/settings.php';
require __DIR__ . '/user.php';
require __DIR__ . '/request.php';
require __DIR__ . '/resource.php';