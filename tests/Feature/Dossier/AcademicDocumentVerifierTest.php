<?php

use App\Domains\Dossier\Services\AcademicDocumentVerifier;

// Texto con la misma forma que extrae el lector de PDF de los documentos del sistema académico.
function fichaText(string $semester = '2026 - 2'): string
{
    return "MATRICULA N° : 0448666 SEMESTRE : {$semester} CICLO : X\n"
        ."558 PRACTICA PRE PROFESIONAL X A 1 8,00\n"
        ."UNIVERSIDAD NACIONAL JOSÉ FAUSTINO SÁNCHEZ CARRIÓN\nVÁLIDO SÓLO PARA FINES INFORMATIVOS\n"
        ."CÓDIGO UNIVERSITARIO\nAPELLIDOS Y NOMBRES\nESCUELA PROFESIONAL\n"
        .": 0331234567\n: PÉREZ QUISPE, ANA LUCÍA\n: INGENIERÍA DE SISTEMAS\nFICHA DE MATRÍCULA";
}

function recordText(): string
{
    return str_replace(['FICHA DE MATRÍCULA', 'MATRICULA N°'], ['RECORD ACADÉMICO POR MATRÍCULA', 'MATRICULA'], fichaText('2021 - 2'));
}

function student(array $overrides = []): array
{
    return array_merge([
        'code' => '0331234567',
        'names' => 'Ana Lucía',
        'surnames' => 'Pérez Quispe',
        'school' => 'Ingeniería de Sistemas',
        'year' => 2026,
    ], $overrides);
}

beforeEach(fn () => $this->verifier = app(AcademicDocumentVerifier::class));

test('accepts the student own ficha and record', function () {
    expect($this->verifier->check(fichaText(), 'ficha', student()))->toBeNull()
        ->and($this->verifier->check(recordText(), 'record', student()))->toBeNull();
});

test('rejects a record uploaded in the ficha slot and vice versa', function () {
    expect($this->verifier->check(recordText(), 'ficha', student()))
        ->toBe('Subiste un Récord Académico. En este espacio va la Ficha de Matrícula.')
        ->and($this->verifier->check(fichaText(), 'record', student()))
        ->toBe('Subiste una Ficha de Matrícula. En este espacio va el Récord Académico.');
});

test('rejects documents of another student', function () {
    expect($this->verifier->check(fichaText(), 'ficha', student(['code' => '0339999999'])))
        ->toContain('pertenece a otro estudiante (código 0331234567)')
        ->and($this->verifier->check(fichaText(), 'ficha', student(['code' => null, 'names' => 'Luis', 'surnames' => 'Rojas Díaz'])))
        ->toContain('no está a tu nombre');
});

test('rejects documents of another school', function () {
    expect($this->verifier->check(fichaText(), 'ficha', student(['school' => 'Ingeniería Industrial'])))
        ->toBe('La Ficha de Matrícula no corresponde a tu escuela profesional (Ingeniería Industrial).');
});

test('rejects a ficha from another year', function () {
    expect($this->verifier->check(fichaText('2024 - 1'), 'ficha', student()))
        ->toBe('La Ficha de Matrícula es del semestre 2024-1. Sube tu ficha del año 2026.');
});

test('rejects scanned or foreign documents', function () {
    expect($this->verifier->check('', 'ficha', student()))->toContain('no un escaneo ni una foto')
        ->and($this->verifier->check(str_repeat('Factura electrónica de venta ', 5), 'record', student()))
        ->toContain('no es de la Universidad Nacional José Faustino Sánchez Carrión');
});
