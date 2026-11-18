<?php

namespace App\Domains\Company\Http\Controllers;

use App\Domains\Company\Contracts\ActiveCompanyResolver;
use App\Domains\Company\Http\Requests\UpdateCompanyProfileRequest;
use App\Domains\Company\Models\Company;
use App\Domains\Identity\Models\User;
use App\Shared\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class CompanyProfileController extends Controller
{
    public function __construct(private ActiveCompanyResolver $companies) {}

    public function edit(Request $request): Response
    {
        $company = $this->companies->company($request->user());

        return Inertia::render('company/profile', [
            'company' => $this->payload($company, $request->user()),
        ]);
    }

    public function update(UpdateCompanyProfileRequest $request): RedirectResponse
    {
        $company = $this->companies->company($request->user());

        $data = $request->validated();
        unset($data['photo'], $data['remove_photo']);

        $company->fill($data);

        if ($request->boolean('remove_photo')) {
            $this->deleteLogo($company);
            $company->path_photo = null;
        } elseif ($request->hasFile('photo')) {
            $this->deleteLogo($company);
            $company->path_photo = $request->file('photo')->store('companies/logos', 'public');
        }

        $company->save();

        return back()->with('success', 'Datos de la empresa actualizados correctamente.');
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(Company $company, User $user): array
    {
        return [
            'id' => $company->id,
            'name' => $company->name,
            'ruc' => $company->ruc,
            'razon' => $company->razon,
            'address' => $company->address,
            'phone' => $company->phone,
            'email' => $company->email,
            'website' => $company->website,
            'representative_name' => $company->representative_name,
            'representative_phone' => $company->representative_phone,
            'logo_url' => $this->logoUrl($company),
            'activated_at' => $company->activated_at?->toIso8601String(),
            'account' => [
                'email' => $user->email,
                'code' => str($user->email)->before('@')->toString(),
            ],
        ];
    }

    private function logoUrl(Company $company): ?string
    {
        $path = $company->path_photo;

        if (! $path) {
            return null;
        }

        if (str_starts_with($path, 'http') || str_starts_with($path, '/storage/')) {
            return $path;
        }

        return Storage::disk('public')->url($path);
    }

    private function deleteLogo(Company $company): void
    {
        $path = $company->path_photo;

        if (! $path || str_starts_with($path, 'http') || str_starts_with($path, '/storage/')) {
            return;
        }

        Storage::disk('public')->delete($path);
    }
}
