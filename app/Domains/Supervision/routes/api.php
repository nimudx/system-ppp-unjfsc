<?php

use App\Domains\Supervision\Http\Controllers\InternshipGroupController;
use App\Domains\Supervision\Http\Controllers\SupervisionController;
use Illuminate\Support\Facades\Route;

Route::post('internship-groups', [InternshipGroupController::class, 'store']);
Route::post('internship-groups/{group}/students', [InternshipGroupController::class, 'attachStudents']);
Route::delete('internship-groups/{group}/students/remove', [InternshipGroupController::class, 'detachStudents']);
Route::post('internship-groups/{group}/students/move', [InternshipGroupController::class, 'moveStudents']);
Route::post('supervisions/{supervision}/evaluation', [SupervisionController::class, 'storeEvaluation']);
Route::patch('supervisions/{evaluation}/status', [SupervisionController::class, 'updateEvaluationStatus']);
