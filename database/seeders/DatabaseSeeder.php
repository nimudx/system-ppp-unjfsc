<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * No usa factories a propósito: fakerphp/faker es require-dev y no
     * existe en la imagen de producción (composer install --no-dev). Un
     * factory tampoco es la herramienta correcta para crear el admin real.
     */
    public function run(): void
    {
        // Catálogos: se ejecutan en todos los entornos (el orden importa).
        $this->call([
            TypeUserSeeder::class,
            RoleSeeder::class,
            SemesterSeeder::class,
            FacultiesSeeder::class,
            SectionSeeder::class,
            ModuleSeeder::class,
            PositionSeeder::class,
            DocumentTypeSeeder::class,
            DocumentTypeRoleSeeder::class,
        ]);

        // Datos de prueba con password débil: nunca en producción.
        if (! app()->isProduction()) {
            $this->call([
                AdminUserSeeder::class,
                TitularUserSeeder::class,
                SupervisorUserSeeder::class,
                StudentUserSeeder::class,
                DemoCompanySeeder::class,
            ]);
        }
    }
}
