<?php

use App\Domains\Company\Http\Controllers\CompanyController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/registro-empresa', function () {
    return Inertia::render('company/register');
})->name('empresa.registro');

Route::middleware(['auth', 'type:1,2', 'approved', 'role:3'])->group(function () {
    Route::get('/empresas', [CompanyController::class, 'index'])
        ->name('academic.companies.index');
});

Route::middleware(['auth', 'type:1,2', 'approved', 'role:5'])->group(function () {
    Route::get('/estudiante/registro-empresa', function () {
        return Inertia::render('company/student-registration');
    })->name('student.company-registration');
});

Route::get('/empresa/activar', function () {
    return Inertia::render('company/activation');
})->name('company.activation');

Route::get('/dev/vista-previa/registro-empresa', function () {
    abort_unless(app()->environment('local'), 404);

    return Inertia::render('company/student-registration', [
        'standalonePreview' => true,
    ]);
})->name('company.registration.preview');

Route::get('/dev/vista-previa/empresas', function () {
    abort_unless(app()->environment('local'), 404);

    return Inertia::render('company/index', [
        'companies' => [],
        'standalonePreview' => true,
    ]);
})->name('company.management.preview');
