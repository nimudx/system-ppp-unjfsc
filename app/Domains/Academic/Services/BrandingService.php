<?php

namespace App\Domains\Academic\Services;

use App\Domains\Academic\Models\AppSetting;
use App\Domains\Identity\Models\Assignment;
use App\Domains\Identity\Models\User;
use App\Shared\Enums\Role;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

/**
 * Logo que aparece junto a "Sistema de Practicas".
 *
 * Orden: logo de la sección del perfil activo (lo sube el docente titular y lo ven sus
 * alumnos y supervisores) → logo general (lo sube el administrador) → escudo por defecto.
 */
class BrandingService
{
    public const SCOPE_GLOBAL = 'global';

    public const SCOPE_SECTION = 'section';

    public function logoUrlFor(?User $user): ?string
    {
        $sectionLogo = $user ? $this->activeAssignment($user)?->section?->logo_path : null;

        return $this->url($sectionLogo ?? AppSetting::get(AppSetting::GLOBAL_LOGO));
    }

    /**
     * Qué logo puede cambiar el usuario con su perfil activo: el general (administrador),
     * el de su sección (docente titular) o ninguno.
     *
     * @return array{scope: string, label: string, path: ?string}|null
     */
    public function manageableLogo(User $user): ?array
    {
        $assignment = $this->activeAssignment($user);

        if ($user->type_user_id === 1 || $assignment?->role_id === Role::ADMIN->value) {
            return [
                'scope' => self::SCOPE_GLOBAL,
                'label' => 'Logo general de la plataforma',
                'path' => AppSetting::get(AppSetting::GLOBAL_LOGO),
            ];
        }

        if ($assignment?->role_id === Role::DTITULAR->value && $assignment->section) {
            return [
                'scope' => self::SCOPE_SECTION,
                'label' => 'Logo de tu sección '.$assignment->section->name.' ('.$assignment->section->school?->name.')',
                'path' => $assignment->section->logo_path,
            ];
        }

        return null;
    }

    public function updateLogo(User $user, UploadedFile $file): void
    {
        $this->replaceLogo($user, $file->store('branding', 'public'));
    }

    public function removeLogo(User $user): void
    {
        $this->replaceLogo($user, null);
    }

    /**
     * Ruta relativa, igual que las fotos de perfil: no depende de APP_URL.
     */
    public function url(?string $path): ?string
    {
        return $path ? '/storage/'.ltrim($path, '/') : null;
    }

    private function replaceLogo(User $user, ?string $newPath): void
    {
        $manageable = $this->manageableLogo($user);
        abort_unless($manageable, 403, 'Tu perfil no puede cambiar el logo.');

        if ($manageable['path']) {
            Storage::disk('public')->delete($manageable['path']);
        }

        if ($manageable['scope'] === self::SCOPE_GLOBAL) {
            AppSetting::put(AppSetting::GLOBAL_LOGO, $newPath);

            return;
        }

        $this->activeAssignment($user)->section->update(['logo_path' => $newPath]);
    }

    /**
     * Perfil académico activo de la sesión, siempre que pertenezca al usuario.
     */
    private function activeAssignment(User $user): ?Assignment
    {
        $assignmentId = session('assignment_id');

        if (! $assignmentId) {
            return null;
        }

        return Assignment::with('section.school')
            ->whereKey($assignmentId)
            ->where('user_id', $user->id)
            ->where('status', 1)
            ->first();
    }
}
