<?php

namespace App\Domains\Identity\Http\Controllers\Settings;

use App\Domains\Academic\Services\BrandingService;
use App\Domains\Identity\Http\Requests\BrandingLogoUpdateRequest;
use App\Shared\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BrandingController extends Controller
{
    public function __construct(protected BrandingService $branding) {}

    public function edit(Request $request): Response
    {
        $manageable = $this->branding->manageableLogo($request->user());
        abort_unless($manageable, 403, 'Tu perfil no puede cambiar el logo.');

        return Inertia::render('identity/settings/branding', [
            'scope' => $manageable['scope'],
            'label' => $manageable['label'],
            'currentLogo' => $this->branding->url($manageable['path']),
        ]);
    }

    public function update(BrandingLogoUpdateRequest $request): RedirectResponse
    {
        $this->branding->updateLogo($request->user(), $request->file('logo'));

        return back()->with('message', 'Logo actualizado correctamente.');
    }

    public function destroy(Request $request): RedirectResponse
    {
        $this->branding->removeLogo($request->user());

        return back()->with('message', 'Se restauró el logo original.');
    }
}
