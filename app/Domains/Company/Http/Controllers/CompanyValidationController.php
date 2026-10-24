<?php

namespace App\Domains\Company\Http\Controllers;

use App\Domains\Company\Enums\CompanyRequestState as State;
use App\Domains\Company\Http\Requests\ReviewCompanyValidationRequest;
use App\Domains\Company\Http\Requests\SubmitCompanyValidationRequest;
use App\Domains\Company\Http\Resources\CompanyValidationResource;
use App\Domains\Company\Models\Company;
use App\Domains\Company\Models\CompanyValidationRequest;
use App\Domains\Company\Services\CompanyValidationService;
use App\Domains\Company\Support\CompanyWorkflowAccess;
use App\Domains\Internship\Http\Requests\StorePlacementRequest;
use App\Domains\Internship\Services\PlacementService;
use App\Shared\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class CompanyValidationController extends Controller
{
    public function __construct(private CompanyValidationService $service, private CompanyWorkflowAccess $access) {}

    public function lookup(Request $request, string $ruc)
    {
        $this->access->assignment($request->user(), 5);
        validator(['ruc' => $ruc], ['ruc' => ['required', 'regex:/^[0-9]{11}$/']])->validate();
        $company = Company::where('ruc', $ruc)->first();
        abort_if($company && $company->status != 1, 409, 'La empresa está inactiva.');

        return response()->json(['found' => $company !== null, 'next_action' => $company ? 'send_confirmation' : 'send_request',
            'company' => $company?->only(['id', 'ruc', 'name', 'razon', 'address', 'phone', 'email']),
            'declaration' => ['text' => config('company_validation.declaration_text'), 'version' => config('company_validation.declaration_version')],
        ]);
    }

    public function current(Request $request)
    {
        $student = $this->access->assignment($request->user(), 5);
        $item = CompanyValidationRequest::where('assignment_id', $student->id)->first();

        return $item ? new CompanyValidationResource($item) : response()->json(['data' => null]);
    }

    public function store(SubmitCompanyValidationRequest $request)
    {
        return (new CompanyValidationResource($this->service->submit($request->user(), $request->validated(), $request->file('ruc_document'))))->response()->setStatusCode(201);
    }

    public function resubmit(SubmitCompanyValidationRequest $request, CompanyValidationRequest $companyRequest)
    {
        $this->access->studentRequest($request->user(), $companyRequest, true);

        return new CompanyValidationResource($this->service->submit($request->user(), $request->validated(), $request->file('ruc_document'), $companyRequest));
    }

    public function index(Request $request)
    {
        $request->validate(['state' => ['nullable', Rule::enum(State::class)], 'per_page' => 'nullable|integer|min:1|max:100']);
        if ($request->user()->type_user_id === 3) {
            $company = $this->access->company($request->user());
            $query = CompanyValidationRequest::where('company_id', $company->id);
        } else {
            $teacher = $this->access->assignment($request->user(), 3);
            $query = $this->access->teacherQuery($teacher);
        }

        return CompanyValidationResource::collection($query->when($request->filled('state'), fn ($q) => $q->where('state', $request->input('state')))->with(['assignment.user.person', 'assignment.section.school', 'assignment.semester', 'company', 'events'])->latest()->paginate($request->integer('per_page', 15)));
    }

    private function authorizeView(Request $request, CompanyValidationRequest $item): void
    {
        if ($request->user()->type_user_id === 3) {
            abort_unless($item->company_id === $this->access->company($request->user())->id, 403);
        } elseif ($item->assignment->user_id === $request->user()->id) {
            $this->access->studentRequest($request->user(), $item);
        } else {
            $this->access->teacherRequest($request->user(), $item);
        }
    }

    public function show(Request $request, CompanyValidationRequest $companyRequest)
    {
        $this->authorizeView($request, $companyRequest);

        return new CompanyValidationResource($companyRequest);
    }

    public function document(Request $request, CompanyValidationRequest $companyRequest)
    {
        $this->authorizeView($request, $companyRequest);
        abort_unless($companyRequest->ruc_document_path && Storage::disk('local')->exists($companyRequest->ruc_document_path), 404);

        return Storage::disk('local')->download($companyRequest->ruc_document_path, 'ficha-ruc.pdf', ['Content-Type' => 'application/pdf', 'Cache-Control' => 'private, no-store']);
    }

    public function review(ReviewCompanyValidationRequest $request, CompanyValidationRequest $companyRequest)
    {
        return new CompanyValidationResource($this->service->review($request->user(), $companyRequest, $request->validated('decision'), $request->validated('comment')));
    }

    public function resend(Request $request, CompanyValidationRequest $companyRequest)
    {
        return new CompanyValidationResource($this->service->resend($request->user(), $companyRequest));
    }

    public function decide(Request $request, CompanyValidationRequest $companyRequest)
    {
        $data = $request->validate(['decision' => 'required|in:accept,reject', 'comment' => 'nullable|required_if:decision,reject|string|max:2000']);

        return new CompanyValidationResource($this->service->decide($request->user(), $companyRequest, $data['decision'], $data['comment'] ?? null));
    }

    public function placement(StorePlacementRequest $request, PlacementService $placements)
    {
        $student = $this->access->assignment($request->user(), 5, true);
        $placement = $placements->registerPlacement($request->validated(), $student);

        return response()->json(['data' => $placement->load('company', 'area'), 'internship_id' => \App\Domains\Internship\Models\Internship::where('placement_id', $placement->id)->value('id'), 'can_upload_documents' => true], 201);
    }
}
