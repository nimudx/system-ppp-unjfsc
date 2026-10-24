<?php

use App\Domains\Documents\Http\Controllers\DocumentSettingController;
use App\Domains\Documents\Http\Controllers\SignedDocumentController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'type:1,2', 'approved', 'role:1,2,3'])
    ->name('settings.academic.')
    ->prefix('settings')
    ->group(function () {
        Route::get('document', [DocumentSettingController::class, 'index'])->name('document');
        Route::post('document', [DocumentSettingController::class, 'store'])->name('document.store');
        Route::put('document/{document}', [DocumentSettingController::class, 'update'])->name('document.update');
        Route::delete('document/{document}', [DocumentSettingController::class, 'destroy'])->name('document.destroy');
    });

// Vista previa de archivos: solo con sesión y URL firmada (Document::signedFileUrl).
Route::get('documents/{document}/file', SignedDocumentController::class)
    ->middleware(['auth', 'signed'])
    ->name('documents.file');
