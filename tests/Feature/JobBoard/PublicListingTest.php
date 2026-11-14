<?php

use Database\Seeders\DatabaseSeeder;
use Inertia\Testing\AssertableInertia as Assert;

/*
 * La v1 de la bolsa laboral NO tiene listado público: el flujo es
 * empresa -> admin -> docente titular. La vitrina `/bolsa` se conserva tal
 * cual (pantalla de demostración) y no expone vacantes ni candidatos.
 */

beforeEach(function () {
    $this->seed(DatabaseSeeder::class);
});

test('la vitrina publica existente se mantiene sin exponer vacantes', function () {
    $this->get('/bolsa')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('jobboard/public/index')
            ->missing('vacancies')
            ->missing('candidates')
        );
});

test('las areas internas exigen autenticacion', function (string $url) {
    $this->get($url)->assertRedirect(route('login'));
})->with([
    '/empresa/bolsa',
    '/empresa/bolsa/crear',
    '/bolsa/administracion',
    '/bolsa/vacantes',
]);

test('los detalles de vacantes no son accesibles sin sesion', function () {
    $this->getJson('/bolsa/administracion/1/detalle')->assertUnauthorized();
    $this->getJson('/bolsa/vacantes/1/detalle')->assertUnauthorized();
});
