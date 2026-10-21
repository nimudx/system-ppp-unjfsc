<?php

use App\Http\Controllers\RequestController;
use Illuminate\Support\Facades\Route;

Route::get('requests/by-assignment/{assignment}', [RequestController::class, 'getRequestAssignment'])->name('requests.by-assignment');
Route::patch('requests/{request}/management-status', [RequestController::class, 'updateManagementRequestStatus'])->name('requests.management.status');
