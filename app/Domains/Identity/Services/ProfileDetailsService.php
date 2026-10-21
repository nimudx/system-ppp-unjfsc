<?php

namespace App\Domains\Identity\Services;

use Illuminate\Database\Eloquent\Model;

class ProfileDetailsService
{
    /**
     * Update the user's profile details.
     */
    public function updateDetails(Model $authenticable, array $data): Model
    {
        $authenticable->update($data);

        return $authenticable;
    }
}
