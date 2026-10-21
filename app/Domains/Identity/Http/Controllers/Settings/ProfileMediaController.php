<?php

namespace App\Domains\Identity\Http\Controllers\Settings;

use App\Domains\Identity\Http\Requests\ProfileMediaUpdateRequest;
use App\Domains\Identity\Services\ProfileMediaService;
use App\Shared\Http\Controllers\Controller;

class ProfileMediaController extends Controller
{
    public function __construct(protected ProfileMediaService $service) {}

    public function update(ProfileMediaUpdateRequest $request)
    {
        $person = $request->user()->person;

        $this->service->updateMedia(
            $person,
            $request->file('photo') === 'deleted' ? 'deleted' : $request->file('photo'),
            $request->file('banner') === 'deleted' ? 'deleted' : $request->file('banner')
        );

        return back()->with([
            'message' => 'Medios actualizados exitosamente',
        ], 200);
    }
}
