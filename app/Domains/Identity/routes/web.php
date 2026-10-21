<?php

use App\Domains\Identity\Http\Controllers\AcademicSessionController;
use App\Domains\Identity\Http\Controllers\Settings\PasswordController;
use App\Domains\Identity\Http\Controllers\Settings\ProfileController;
use App\Domains\Identity\Http\Controllers\Settings\ProfileDetailsController;
use App\Domains\Identity\Http\Controllers\Settings\ProfileMediaController;
use App\Domains\Identity\Http\Controllers\Settings\TwoFactorAuthenticationController;
use App\Domains\Identity\Http\Controllers\UserAssignmentController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth'])->group(function () {
    Route::patch('semesters/{semester}/select', [AcademicSessionController::class, 'syncSemester'])->name('semesters.select');
    Route::patch('assignments/{assignment}/select', [AcademicSessionController::class, 'syncAssignment'])->name('assignments.select');
    Route::patch('staffs/{staff}/select', [AcademicSessionController::class, 'syncStaff'])->name('staffs.select');
});

Route::middleware(['auth', 'type:1,2', 'approved'])->name('academic.')->group(function () {
    Route::middleware(['role:1,2,3'])->group(function () {

        // Filtrado de Usuarios (Estilo Dossier)
        Route::get('/users/filter', [UserAssignmentController::class, 'getAssignmentsByFilter'])->name('users.filter');
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
});

Route::middleware(['auth'])->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');

    Route::post('settings/profile/media', [ProfileMediaController::class, 'update'])->name('profile.media.update');
    Route::patch('settings/profile/details', [ProfileDetailsController::class, 'update'])->name('profile.details.update');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('user-password.edit');

    Route::put('settings/password', [PasswordController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    Route::get('settings/appearance', function () {
        return Inertia::render('identity/settings/appearance');
    })->name('appearance.edit');

    Route::get('settings/two-factor', [TwoFactorAuthenticationController::class, 'show'])
        ->name('two-factor.show');

    Route::get('settings/about', function () {
        return Inertia::render('identity/settings/about');
    })->name('settings.about');
});
