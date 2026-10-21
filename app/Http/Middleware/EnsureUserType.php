<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserType
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$types): Response
    {
        if (! auth()->check()) {
            return redirect()->route('login');
        }

        $user = auth()->user();

        // Cargamos la relación si no está cargada
        $typeId = $user->type_user_id;

        if (! in_array($typeId, $types)) {
            // abort(403, 'No tienes permiso para acceder a esta área según tu tipo de usuario.');
            $request->session()->flash('error', 'No tienes permiso para acceder a esta área según tu tipo de usuario.');

            return redirect()->route('dashboard');
        }

        return $next($request);
    }
}
