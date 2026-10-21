<?php

use App\Domains\Documents\Http\Controllers\DocumentController;
use Illuminate\Support\Facades\Route;

Route::post('/documents/upload', [DocumentController::class, 'store']);
Route::patch('documents/{document}/status', [DocumentController::class, 'updateStatus']);
