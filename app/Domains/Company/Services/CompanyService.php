<?php

namespace App\Domains\Company\Services;

use App\Domains\Company\Models\Area;
use App\Domains\Company\Models\Company;
use App\Domains\Company\Models\Staff;
use Illuminate\Support\Collection;

class CompanyService
{
    public function verifyCompany(string $ruc): ?array
    {
        $company = Company::query()->where('ruc', $ruc)->first();

        if (! $company) {
            return null;
        }

        return [
            'id' => $company->id,
            'ruc' => $company->ruc,
            'name' => $company->name,
            'address' => $company->address,
            'phone' => $company->phone,
            'email' => $company->email,
            'areas' => $this->listAreas($company->id),
        ];
    }

    public function registerCompany(array $data): Company
    {
        $company = Company::query()->create([
            'name' => $data['name'],
            'ruc' => $data['ruc'],
            'razon' => $data['razon'] ?? $data['name'],  // fallback: si no mandan razón social, usa el nombre
            'address' => $data['address'] ?? '',
            'phone' => $data['phone'] ?? '',
            'email' => $data['email'] ?? '',
        ]);

        return $company;
    }

    public function listAreas(int $companyId): Collection
    {
        $areas = Area::query()->where('company_id', $companyId)->get();

        return $areas;
    }

    public function registerStaff(array $data): Staff
    {
        $staff = Staff::query()->create([
            'name' => $data['name'],
            'position' => $data['position'],
            'email' => $data['email'],
            'phone' => $data['phone'],
        ]);

        return $staff;
    }

    public function registerArea(array $data): Area
    {
        return Area::firstOrCreate(
            ['name' => $data['name'], 'company_id' => $data['company_id']],
            ['description' => $data['description'] ?? null]
        );
    }
}
