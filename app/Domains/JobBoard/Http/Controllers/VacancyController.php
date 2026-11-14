<?php

namespace App\Domains\JobBoard\Http\Controllers;

use App\Domains\Company\Contracts\ActiveCompanyResolver;
use App\Domains\JobBoard\Enums\VacancyCloseReason;
use App\Domains\JobBoard\Enums\VacancyModality;
use App\Domains\JobBoard\Enums\VacancyType;
use App\Domains\JobBoard\Http\Requests\CloseVacancyRequest;
use App\Domains\JobBoard\Http\Requests\StoreVacancyRequest;
use App\Domains\JobBoard\Http\Requests\UpdateVacancyRequest;
use App\Domains\JobBoard\Models\Vacancy;
use App\Domains\JobBoard\Services\VacancyService;
use App\Domains\JobBoard\Support\SchoolOptions;
use App\Domains\JobBoard\Support\VacancyPresenter;
use App\Shared\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class VacancyController extends Controller
{
    public function __construct(
        private VacancyService $service,
        private VacancyPresenter $presenter,
        private ActiveCompanyResolver $companies,
        private SchoolOptions $schoolOptions,
    ) {}

    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Vacancy::class);

        $company = $this->companies->company($request->user());

        $vacancies = Vacancy::query()
            ->where('company_id', $company->id)
            ->with(['company', 'schools.faculty'])
            ->latest('updated_at')
            ->get();

        return Inertia::render('jobboard/company/index', [
            'vacancies' => $vacancies
                ->map(fn (Vacancy $vacancy) => $this->presenter->companyDetail($vacancy))
                ->values()
                ->all(),
            'company' => [
                'name' => $company->name,
                'ruc' => $company->ruc,
            ],
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', Vacancy::class);

        return Inertia::render('jobboard/company/form', [
            'vacancy' => null,
            'schools' => $this->schoolOptions->all(),
            'options' => $this->options(),
        ]);
    }

    public function edit(Vacancy $vacancy): Response
    {
        Gate::authorize('update', $vacancy);

        return Inertia::render('jobboard/company/form', [
            'vacancy' => $this->presenter->companyDetail($vacancy),
            'schools' => $this->schoolOptions->all(),
            'options' => $this->options(),
        ]);
    }

    public function store(StoreVacancyRequest $request): RedirectResponse
    {
        Gate::authorize('create', Vacancy::class);

        $this->service->create($request->user(), $request->validated());

        return redirect()
            ->route('company.jobboard.index')
            ->with('message', 'Vacante guardada como borrador.');
    }

    public function update(UpdateVacancyRequest $request, Vacancy $vacancy): RedirectResponse
    {
        Gate::authorize('update', $vacancy);

        $this->service->update($request->user(), $vacancy, $request->validated());

        return redirect()
            ->route('company.jobboard.index')
            ->with('message', 'Vacante actualizada.');
    }

    public function submit(Request $request, Vacancy $vacancy): RedirectResponse
    {
        Gate::authorize('submit', $vacancy);

        $this->service->submit($request->user(), $vacancy);

        return back()->with('message', 'Vacante enviada a revisión.');
    }

    public function close(CloseVacancyRequest $request, Vacancy $vacancy): RedirectResponse
    {
        Gate::authorize('close', $vacancy);

        $this->service->close(
            $request->user(),
            $vacancy,
            VacancyCloseReason::from($request->validated('reason')),
        );

        return back()->with('message', 'Vacante cerrada.');
    }

    /**
     * @return array<string, array<int, array{value: string, label: string}>>
     */
    private function options(): array
    {
        return [
            'types' => collect(VacancyType::cases())
                ->map(fn (VacancyType $type) => ['value' => $type->value, 'label' => $type->label()])
                ->all(),
            'modalities' => collect(VacancyModality::cases())
                ->map(fn (VacancyModality $modality) => ['value' => $modality->value, 'label' => $modality->label()])
                ->all(),
        ];
    }
}
