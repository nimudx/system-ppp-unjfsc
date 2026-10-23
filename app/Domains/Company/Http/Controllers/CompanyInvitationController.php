<?php

namespace App\Domains\Company\Http\Controllers;

use App\Domains\Company\Http\Requests\ActivateCompanyAccountRequest;
use App\Domains\Company\Services\CompanyValidationService;
use App\Shared\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;

class CompanyInvitationController extends Controller
{
    public function __construct(private CompanyValidationService $service) {}

    public function show(string $token)
    {
        $invitation = $this->service->invitation($token);
        $item = $invitation->validationRequest;

        return response()->json(['data' => [
            'company' => $invitation->company->only(['name', 'razon', 'ruc', 'email', 'address', 'phone']),
            'student' => ['name' => trim($item->assignment->user->person?->names.' '.$item->assignment->user->person?->surnames), 'school' => $item->assignment->section->school->name],
            'terms' => ['text' => config('company_validation.terms_text'), 'version' => config('company_validation.terms_version')],
            'expires_at' => $invitation->expires_at, 'requires_activation' => $invitation->company->account_user_id === null,
        ]])->header('Cache-Control', 'no-store')->header('Referrer-Policy', 'no-referrer');
    }

    public function activate(ActivateCompanyAccountRequest $request, string $token)
    {
        $user = $this->service->activate($token, $request->validated());
        Auth::login($user);
        $request->session()->regenerate();
        $request->session()->forget(['assignment_id', 'semester_id']);

        return response()->json(['data' => ['user' => $user->only(['id', 'name', 'email', 'type_user_id']), 'company_id' => $user->company->id], 'next_url' => config('company_validation.requests_path')], 201);
    }
}
