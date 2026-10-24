<?php

use App\Domains\Company\Http\Controllers\CompanyInvitationController;
use App\Domains\Company\Http\Controllers\CompanyValidationController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/registro-empresa', function () {
    return Inertia::render('company/register');
})->name('empresa.registro');

// JSON con sesión web y CSRF, para el frontend Inertia/React del mismo dominio.
Route::prefix('api/company-validation')->name('company-validation.')->middleware(['auth', 'throttle:60,1'])->group(function () {
    Route::get('companies/{ruc}', [CompanyValidationController::class, 'lookup'])->name('companies.lookup');
    Route::get('current', [CompanyValidationController::class, 'current'])->name('current');
    Route::post('requests', [CompanyValidationController::class, 'store'])->middleware('throttle:10,60')->name('requests.store');
    Route::get('requests', [CompanyValidationController::class, 'index'])->name('requests.index');
    Route::get('requests/{companyRequest}', [CompanyValidationController::class, 'show'])->name('requests.show');
    Route::patch('requests/{companyRequest}', [CompanyValidationController::class, 'resubmit'])->middleware('throttle:10,60')->name('requests.resubmit');
    Route::get('requests/{companyRequest}/ruc-document', [CompanyValidationController::class, 'document'])->name('requests.ruc-document');
    Route::patch('requests/{companyRequest}/review', [CompanyValidationController::class, 'review'])->name('requests.review');
    Route::post('requests/{companyRequest}/resend', [CompanyValidationController::class, 'resend'])->middleware('throttle:3,60')->name('requests.resend');
    Route::patch('requests/{companyRequest}/decision', [CompanyValidationController::class, 'decide'])->name('requests.decision');
    Route::post('placement', [CompanyValidationController::class, 'placement'])->name('placement.store');
});
Route::prefix('api/company-invitations')->name('company-invitations.')->middleware('throttle:10,1')->group(function () {
    Route::get('{token}', [CompanyInvitationController::class, 'show'])->where('token', '[a-zA-Z0-9]{64}')->name('show');
    Route::post('{token}/activate', [CompanyInvitationController::class, 'activate'])->where('token', '[a-zA-Z0-9]{64}')->middleware('guest')->name('activate');
});
