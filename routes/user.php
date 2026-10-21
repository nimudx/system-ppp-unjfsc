<?php

use App\Http\Controllers\Registration\UserRegistrationController;
use Illuminate\Support\Facades\Route;

// Public registration routes

Route::prefix('register')->name('register.')->middleware(['auth', 'verified', 'role:1,2,3'])->group(function () {
    Route::get('/', [UserRegistrationController::class, 'index'])->name('index');
    Route::post('/step-one', [UserRegistrationController::class, 'stepOne'])->name('step-one');
    Route::post('/step-two', [UserRegistrationController::class, 'stepTwo'])->name('step-two');
    Route::post('/academic', [UserRegistrationController::class, 'userAcademicRegistration'])->name('academic');
    Route::post('/academic-massive', [UserRegistrationController::class, 'userAcademicRegistrationMassive'])->name('academic.massive');
    Route::post('/company', [UserRegistrationController::class, 'userCompanyRegistration'])->name('company');
});
