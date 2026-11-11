<?php

namespace App\Domains\Company\Contracts;

use App\Domains\Company\Models\Company;
use App\Domains\Identity\Models\User;

/**
 * Contrato para resolver la empresa activa de una cuenta sin acoplar
 * otros dominios a la implementación interna de Company.
 */
interface ActiveCompanyResolver
{
    public function company(User $user): Company;
}
