<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Domains\Supervision\Models\Module;
use Illuminate\Database\Seeder;

class ModuleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach (['Módulo I', 'Módulo II', 'Módulo III', 'Módulo IV'] as $name) {
            if (Module::where('name', $name)->exists()) {
                continue;
            }

            // Se mantiene la asignación explícita del original (status puede no ser fillable).
            $module = new Module;
            $module->name = $name;
            $module->status = 1;
            $module->save();
        }
    }
}
