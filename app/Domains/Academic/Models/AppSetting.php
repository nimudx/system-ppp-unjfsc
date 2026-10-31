<?php

namespace App\Domains\Academic\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Ajustes generales de la plataforma guardados como clave/valor.
 */
class AppSetting extends Model
{
    public const GLOBAL_LOGO = 'branding.logo_path';

    protected $primaryKey = 'key';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = ['key', 'value'];

    public static function get(string $key): ?string
    {
        return static::query()->whereKey($key)->value('value');
    }

    public static function put(string $key, ?string $value): void
    {
        static::query()->updateOrCreate(['key' => $key], ['value' => $value]);
    }
}
