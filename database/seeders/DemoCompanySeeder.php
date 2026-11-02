<?php

namespace Database\Seeders;

use App\Domains\Company\Models\Company;
use App\Domains\Company\Models\Position;
use App\Domains\Company\Models\Staff;
use App\Domains\Identity\Enums\PersonStatus;
use App\Domains\Identity\Models\Person;
use App\Domains\Identity\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoCompanySeeder extends Seeder
{
    public function run(): void
    {
        $company = Company::firstOrCreate(
            ['ruc' => '20345678901'],
            [
                'name' => 'Empresa Demo S.A.C.',
                'razon' => 'Empresa Demo S.A.C.',
                'address' => 'Jr. Los Olivos 123, Lima',
                'phone' => '987654321',
                'email' => 'empresa.demo@unjfsc.edu.pe',
                'status' => 1,
            ]
        );

        $position = Position::where('name', 'Gerente General')->firstOrFail();

        $person = Person::firstOrCreate(
            ['dni' => '20123456'],
            [
                'names' => 'Laura',
                'surnames' => 'Pérez Rojas',
                'phone' => '998877665',
                'gender' => 'female',
                'status' => PersonStatus::ACTIVE,
            ]
        );

        $user = User::firstOrCreate(
            ['email' => 'empresa.demo@unjfsc.edu.pe'],
            [
                'person_id' => $person->id,
                'name' => 'empresa.demo',
                'password' => Hash::make('12345678'),
                'type_user_id' => 3, // Empresa
            ]
        );

        // Mismo binding explícito que usa la activación de cuenta.
        if ($company->account_user_id === null && $user->type_user_id === 3) {
            $company->update([
                'account_user_id' => $user->id,
                'representative_name' => $person->names.' '.$person->surnames,
                'representative_phone' => $company->phone,
                'activated_at' => now(),
            ]);
        }

        Staff::firstOrCreate(
            ['company_id' => $company->id, 'user_id' => $user->id],
            [
                'position_id' => $position->id,
                'email' => $user->email,
                'phone' => $company->phone,
                'status' => 1,
                'is_select' => true,
            ]
        );
    }
}