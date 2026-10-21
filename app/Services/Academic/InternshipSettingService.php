<?php

namespace App\Services\Academic;

use App\Models\InternshipSetting;
use Illuminate\Support\Facades\DB;

class InternshipSettingService
{
    /**
     * Get or initialize the setting for a specific section.
     */
    public function getSettingForSection(int $sectionId): InternshipSetting
    {
        return InternshipSetting::firstOrCreate(
            ['section_id' => $sectionId],
            [
                'workflow_schema' => [],
                'is_active' => false,
                'status' => 1,
            ]
        );
    }

    /**
     * Save the workflow setting.
     */
    public function saveSetting(int $sectionId, array $workflowSchema): InternshipSetting
    {
        return DB::transaction(function () use ($sectionId, $workflowSchema) {
            $setting = InternshipSetting::firstOrNew(['section_id' => $sectionId]);
            $setting->workflow_schema = $workflowSchema;
            $setting->save();

            return $setting;
        });
    }

    /**
     * Publish the workflow setting.
     */
    public function publishSetting(int $sectionId): InternshipSetting
    {
        return DB::transaction(function () use ($sectionId) {
            $setting = InternshipSetting::where('section_id', $sectionId)->firstOrFail();
            $setting->is_active = true;
            $setting->status = 1; // Active
            $setting->save();

            return $setting;
        });
    }
}
