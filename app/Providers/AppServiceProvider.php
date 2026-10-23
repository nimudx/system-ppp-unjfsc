<?php

namespace App\Providers;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();

        // Preserve polymorphic keys already stored before the domain reorganization.
        Relation::enforceMorphMap([
            'App\\Models\\Area' => \App\Domains\Company\Models\Area::class,
            'App\\Models\\Assignment' => \App\Domains\Identity\Models\Assignment::class,
            'App\\Models\\Boss' => \App\Domains\Company\Models\Boss::class,
            'App\\Models\\Company' => \App\Domains\Company\Models\Company::class,
            'App\\Models\\Document' => \App\Domains\Documents\Models\Document::class,
            'App\\Models\\DocumentType' => \App\Domains\Documents\Models\DocumentType::class,
            'App\\Models\\Dossier' => \App\Domains\Dossier\Models\Dossier::class,
            'App\\Models\\Evaluation' => \App\Domains\Supervision\Models\Evaluation::class,
            'App\\Models\\Faculty' => \App\Domains\Academic\Models\Faculty::class,
            'App\\Models\\Internship' => \App\Domains\Internship\Models\Internship::class,
            'App\\Models\\InternshipGroup' => \App\Domains\Supervision\Models\InternshipGroup::class,
            'App\\Models\\InternshipSetting' => \App\Domains\Internship\Models\InternshipSetting::class,
            'App\\Models\\Module' => \App\Domains\Supervision\Models\Module::class,
            'App\\Models\\Notification' => \App\Domains\Notifications\Models\Notification::class,
            'App\\Models\\NotificationRecipient' => \App\Domains\Notifications\Models\NotificationRecipient::class,
            'App\\Models\\Person' => \App\Domains\Identity\Models\Person::class,
            'App\\Models\\Placement' => \App\Domains\Internship\Models\Placement::class,
            'App\\Models\\Position' => \App\Domains\Company\Models\Position::class,
            'App\\Models\\Resource' => \App\Domains\Resources\Models\Resource::class,
            'App\\Models\\Role' => \App\Domains\Identity\Models\Role::class,
            'App\\Models\\School' => \App\Domains\Academic\Models\School::class,
            'App\\Models\\Section' => \App\Domains\Academic\Models\Section::class,
            'App\\Models\\Semester' => \App\Domains\Academic\Models\Semester::class,
            'App\\Models\\Staff' => \App\Domains\Company\Models\Staff::class,
            'App\\Models\\StudentGroup' => \App\Domains\Supervision\Models\StudentGroup::class,
            'App\\Models\\Supervision' => \App\Domains\Supervision\Models\Supervision::class,
            'App\\Models\\TypeUser' => \App\Domains\Identity\Models\TypeUser::class,
            'practice_submission' => \App\Domains\Supervision\Models\PracticeSubmission::class,
            'App\\Models\\User' => \App\Domains\Identity\Models\User::class,
            'App\\Models\\UserRequest' => \App\Domains\Requests\Models\UserRequest::class,
        ]);
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null
        );
    }
}
