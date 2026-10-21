<?php

namespace Database\Factories;

use App\Domains\Identity\Enums\PersonStatus;
use App\Domains\Identity\Models\Person;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Domains\Identity\Models\Person>
 */
class PersonFactory extends Factory
{
    protected $model = Person::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'dni' => fake()->unique()->numerify('########'),
            'names' => fake()->firstName(),
            'surnames' => fake()->lastName().' '.fake()->lastName(),
            'phone' => fake()->numerify('9########'),
            'gender' => fake()->randomElement(['M', 'F']),
            'status' => PersonStatus::ACTIVE,
        ];
    }
}
