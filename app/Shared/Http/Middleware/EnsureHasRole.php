<?php

namespace App\Shared\Http\Middleware;

use App\Domains\Identity\Models\Assignment;
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

        // La asignación de la sesión debe pertenecer al usuario autenticado y seguir activa.
        $roleId = Assignment::whereKey($assignmentId)
            ->where('user_id', $request->user()?->id)
            ->where('status', 1)
            ->value('role_id');

        if (! $roleId) {
            session()->forget('assignment_id');
            abort(403, 'No tienes una sesion de rol activa');
        }

        if (! in_array((int) $roleId, array_map('intval', $roles), true)) {
            session()->reflash(); // Conserva los mensajes flash anteriores (ej: "cambio exitoso")

            return redirect()->route('dashboard')->with('error', 'No tienes permiso para acceder a esta área con tu rol actual.');
        }

        return $next($request);
    }
}
