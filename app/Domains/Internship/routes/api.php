<?php

use App\Domains\Internship\Http\Controllers\InternshipController;
use Illuminate\Support\Facades\Route;

Route::post('internships/document/store', [InternshipController::class, 'storeDocumentInternship']);
Route::post('internships/{assignment}/store', [InternshipController::class, 'store']);
Route::patch('internships/{document}/status', [InternshipController::class, 'updateInternshipStatus']);
