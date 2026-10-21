<?php

namespace App\Domains\Identity\Http\Controllers\Settings;

use App\Domains\Identity\Http\Requests\ProfileDetailsUpdateRequest;
use App\Domains\Identity\Services\ProfileDetailsService;
use App\Shared\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class ProfileDetailsController extends Controller
{
    public function __construct(protected ProfileDetailsService $service) {}

    public function update(ProfileDetailsUpdateRequest $request): RedirectResponse
    {
        $this->service->updateDetails(
            $request->user()->authenticable,
            $request->validated()
        );

        return back()->with([
            'message' => 'Detalles del perfil actualizados correctamente.',
        ], 200);
    }
}
