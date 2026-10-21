<?php

namespace App\Shared\Http\Middleware;

use App\Domains\Identity\Models\Assignment;
use App\Shared\Enums\Role;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureActiveSemester
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // 1. Permitir siempre rutas de salida, configuración y cambio de contexto
        if ($request->is('logout', 'settings/*', 'semesters/*/select', 'assignments/*/select')) {
            return $next($request);
        }

        $user = $request->user();

        if (! $user) {
            return $next($request);
        }

        // Si es Admin, tiene pase libre
        $assignmentId = session('assignment_id');
        if (! $assignmentId) {
            return $next($request);
        }

        $assignment = Assignment::find($assignmentId);

        if (! $assignment) {
            return $next($request);
        }

        // Si el rol es admin, no bloqueamos nada
        if ($assignment->role_id === Role::ADMIN->value) {
            return $next($request);
        }

        // Si el semestre de la asignación no es activo y la petición no es de lectura
        if ($assignment->semester && $assignment->semester->status->value === 0) {
            if (! $request->isMethod('GET') && ! $request->isMethod('HEAD') && ! $request->isMethod('OPTIONS')) {
                if ($request->header('X-Inertia')) {
                    return back()->with('error', [
                        'message' => 'El semestre ha finalizado. Solo se permite el acceso en modo lectura.',
                        'code' => 'SEMESTER_CLOSED_READ_ONLY',
                        'status' => 403,
                    ]);
                }

                return response()->json([
                    'message' => 'El semestre ha finalizado. Solo se permite el acceso en modo lectura.',
                    'code' => 'SEMESTER_CLOSED_READ_ONLY',
                ], 403);
            }
        }

        return $next($request);
    }
}
