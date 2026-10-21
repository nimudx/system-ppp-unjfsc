<?php

namespace App\Http\Middleware;

use App\Models\Assignment;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureHasRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $assignmentId = session('assignment_id');

        if (! $assignmentId) {
            abort(403, 'No tienes una sesion de rol activa');
        }

        $roleId = Assignment::find($assignmentId)->role_id;

        if (! in_array($roleId, $roles)) {
            session()->reflash(); // Conserva los mensajes flash anteriores (ej: "cambio exitoso")

            return redirect()->route('dashboard')->with('error', 'No tienes permiso para acceder a esta área con tu rol actual.');
        }

        return $next($request);
    }
}
