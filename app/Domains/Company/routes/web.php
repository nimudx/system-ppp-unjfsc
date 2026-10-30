<?php

use App\Domains\Company\Http\Controllers\CompanyController;
use App\Domains\Company\Http\Controllers\CompanyInvitationController;
use App\Domains\Company\Http\Controllers\CompanyValidationController;
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
        return redirect()->route('academic.internship.submission');
    })->name('student.company-registration');
});

Route::middleware(['auth', 'type:3'])->group(function () {
    Route::get('/empresa/solicitudes', function () {
        return Inertia::render('company/requests');
    })->name('company.requests');
});

// Notifications open an HTML screen, never the JSON API resource.
Route::get('/solicitudes-empresa/{companyRequest}', function (\Illuminate\Http\Request $request, int $companyRequest) {
    if ($request->user()->type_user_id === 3) {
        return redirect()->route('company.requests', ['request' => $companyRequest]);
    }
    $assignment = $request->user()->assignments()->whereKey(session('assignment_id'))->firstOrFail();
    if ($assignment->role_id === 3) {
        return redirect()->route('academic.companies.index', ['request' => $companyRequest]);
    }

    return redirect()->route('academic.internship.submission');
})->whereNumber('companyRequest')->middleware('auth')->name('company.request-screen');

Route::get('/empresa/activar', function () {
    return Inertia::render('company/activation');
})->name('company.activation');

Route::get('/dev/vista-previa/registro-empresa', function () {
    abort_unless(app()->environment('local'), 404);

    return redirect()->route('academic.internship.submission');
})->name('company.registration.preview');

Route::get('/dev/vista-previa/empresas', function () {
    abort_unless(app()->environment('local'), 404);

    return redirect()->route('academic.companies.index');
})->name('company.management.preview');

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
