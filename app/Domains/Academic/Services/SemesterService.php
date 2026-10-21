<?php

namespace App\Domains\Academic\Services;

use App\Domains\Academic\Enums\SemesterStatus;
use App\Domains\Academic\Exceptions\SemesterHasRelatedRecordsException;
use App\Domains\Academic\Exceptions\SemesterInvalidCodeException;
use App\Domains\Academic\Exceptions\SemesterPreviousNotFoundException;
use App\Domains\Academic\Exceptions\SemesterRollbackNotAllowedException;
use App\Domains\Academic\Models\Semester;
use App\Domains\Identity\Enums\AssignmentAccessStatus;
use App\Domains\Identity\Models\Assignment;
use App\Domains\Resources\Models\Resource;
use App\Shared\Enums\GeneralStatus;
use Cassandra\Collection;
use Illuminate\Support\Facades\DB;

class SemesterService
{
    /**
     * Lista todos los semestres.
     */
    public function listSemesters(): Collection
    {
        return Semester::query()->get();
    }

    public function closeCurrentSemester(int $semesterId): Semester
    {
        return DB::transaction(function () use ($semesterId) {
            Assignment::query()
                ->where('semester_id', $semesterId)
                ->update(['access_status' => AssignmentAccessStatus::READ_ONLY]);

            Resource::query()
                ->where('semester_id', $semesterId)
                ->where('level', '<', 5)
                ->update(['status' => GeneralStatus::INACTIVE]);

            $currentSemester = Semester::query()->find($semesterId);

            $currentSemester->status = SemesterStatus::INACTIVE;
            $currentSemester->save();

            $newCode = $this->generateNextCode($currentSemester->code);

            $nextSemester = Semester::query()->create([
                'code' => $newCode,
                'cycle' => $currentSemester->cycle,
                'status' => 1,
            ]);

            session(['semester_id' => $nextSemester->id]);

            return $nextSemester;
        });
    }

    /**
     * @@param int
     */
    public function backCurrentSemester(int $semesterId): Semester
    {
        $currentSemester = Semester::query()->find($semesterId);

        if ($currentSemester->status !== SemesterStatus::ACTIVE) {
            throw new SemesterRollbackNotAllowedException;
        }

        if (Semester::query()->count() <= 1) {
            throw new SemesterPreviousNotFoundException;
        }

        if ($currentSemester->assignments()->exists() || $currentSemester->sections()->exists()) {
            throw new SemesterHasRelatedRecordsException;
        }

        $currentSemester->delete();

        $previousSemester = Semester::query()->orderBy('id', 'desc')->first();

        if (! $previousSemester) {
            throw new SemesterPreviousNotFoundException;
        }

        $previousSemester->update(['status' => 1]);
        session(['semester_id' => $previousSemester->id]);

        return $previousSemester;
    }

    private function generateNextCode(string $currentCode): string
    {
        $parts = explode('-', $currentCode);

        if (count($parts) !== 2) {
            throw new SemesterInvalidCodeException;
        }

        $year = $parts[0];
        $number = $parts[1];

        if ($number == 1) {
            return "{$year}-2";
        } else {
            $nextYear = (int) $year + 1;

            return "{$nextYear}-1";
        }
    }
}
