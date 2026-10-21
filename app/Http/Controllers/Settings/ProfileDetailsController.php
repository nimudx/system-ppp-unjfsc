<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileDetailsUpdateRequest;
use App\Services\Settings\ProfileDetailsService;
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
