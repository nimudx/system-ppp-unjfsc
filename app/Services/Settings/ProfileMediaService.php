<?php

namespace App\Services\Settings;

use App\Models\Person;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class ProfileMediaService
{
    /**
     * @param  mixed  $photoFile  (File | 'deleted' | null)
     * @param  mixed  $bannerFile  (File | 'deleted' | null)
     */
    public function updateMedia(Person $person, $photoFile, $bannerFile): Person
    {
        if ($photoFile) {
            $this->processFile($person, 'path_photo', 'avatar', $photoFile);
        }
        if ($bannerFile) {
            $this->processFile($person, 'path_banner', 'banner', $bannerFile);
        }

        $person->save();

        return $person;
    }

    /**
     * @param  mixed  $file  (File | 'deleted' | null)
     */
    private function processFile(Person $person, string $column, string $type, $file): void
    {
        if ($person->{$column}) {
            Storage::disk('public')->delete($person->{$column});
            $person->{$column} = null;
        }

        if ($file !== 'deleted' && $file instanceof UploadedFile) {
            $yearMonth = date('Y/m');
            $modelType = strtolower(class_basename($person));

            $identifier = $person->dni ?? $person->id;

            $folder = "profiles/{$modelType}/{$yearMonth}";
            $filename = "{$identifier}_{$type}_".time().'.'.$file->extension();

            $person->{$column} = $file->storeAs($folder, $filename, 'public');
        }
    }
}
