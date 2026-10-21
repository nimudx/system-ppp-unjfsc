<?php

namespace App\Http\Middleware;

use App\Models\Assignment;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAssignmentAccess
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // 1. Excepciones globales (Siempre accesibles)
        if ($request->is('logout', 'settings/*', 'semesters/*/select', 'assignments/*/select')) {
            return $next($request);
        }

        // Los administradores (Role 1) y SubAdmins (Role 2) en su contexto global suelen tener acceso full,
        // pero aquí validamos según la asignación seleccionada en sesión.

        $assignmentId = session('assignment_id');
        $assignment = Assignment::find($assignmentId);

        // 1.5 EXCEPCIÓN: Administradores (1) y Sub-Administradores (2) siempre tienen acceso total
        if ($assignment && in_array($assignment->role_id, [1, 2])) {
            return $next($request);
        }

        // 2. NIVEL CRÍTICO: Bloqueado o Inactivo
        if (! $assignment || $assignment->isBlocked()) {
            session()->forget('assignment_id');

            return redirect()->route('profile.select')->with('error', 'Acceso denegado a esta asignación.');
        }

        // 3. NIVEL DE INTEGRIDAD: Solo Lectura (READ_ONLY)
        // Bloqueamos cualquier método que intente "escribir" (POST, PUT, PATCH, DELETE)
        if ($assignment->isReadOnly() && ! $request->isMethod('GET')) {
            return back()->with('error', 'La asignación está en modo lectura. No se permiten cambios.');
        }

        // 4. NIVEL DE VALIDACIÓN: Limitado (LIMITED)
        // El usuario debe completar su dossier/validación antes de acceder al resto del sistema.
        if ($assignment->isLimited() && ! $request->routeIs('academic.dossiers.submission')) {
            // Permitir solo la ruta de guardado de documentos de la validación
            if (! $request->is('dossiers/document/store')) {
                return redirect()->route('academic.dossiers.submission');
            }
        }

        return $next($request);
    }
}
