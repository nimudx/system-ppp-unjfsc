<?php

namespace App\Domains\Identity\Actions;

use App\Domains\Identity\Models\User;
use App\Shared\Concerns\PasswordValidationRules;
use App\Shared\Concerns\ProfileValidationRules;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            ...$this->profileRules(),
            'password' => $this->passwordRules(),
        ])->validate();

        return User::create([
            'name' => $input['name'],
            'email' => $input['email'],
            'password' => $input['password'],
            'authenticable_id' => 1, // This should probably be dynamic but keeping consistency with existing logic
            'authenticable_type' => (new \App\Domains\Identity\Models\Person)->getMorphClass(),
        ]);
    }
}
