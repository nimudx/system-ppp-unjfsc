<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileMediaUpdateRequest;
use App\Services\Settings\ProfileMediaService;

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
