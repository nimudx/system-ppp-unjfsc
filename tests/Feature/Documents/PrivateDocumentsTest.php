<?php

use App\Domains\Documents\Models\Document;
use App\Domains\Documents\Models\DocumentType;
use App\Domains\Dossier\Models\Dossier;
use App\Domains\Identity\Models\Assignment;
use App\Domains\Identity\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    $this->seed(DatabaseSeeder::class);
    Storage::fake('public');
    Storage::fake('local');
});

function privateDocument(): Document
{
    $student = Assignment::where('role_id', 5)->firstOrFail();
    $path = 'dossiers/2026-1/'.$student->id.'/ficha/type_ficha_test.pdf';
    Storage::disk(Document::DISK)->put($path, '%PDF-1.4 prueba');

    return Dossier::create(['assignment_id' => $student->id])->documents()->create([
        'name' => 'ficha.pdf',
        'document_type_id' => DocumentType::firstOrFail()->id,
        'path' => $path,
        'comment' => '',
        'uploaded_by' => $student->id,
    ]);
}

test('documents are stored on the private disk', function () {
    $document = privateDocument();

    expect(Document::DISK)->toBe('local');
    Storage::disk('local')->assertExists($document->path);
    Storage::disk('public')->assertMissing($document->path);
});

test('a document file cannot be opened without logging in', function () {
    $document = privateDocument();

    $this->get($document->signedFileUrl())->assertRedirect(route('login'));
});

test('a document file cannot be opened without a valid signature', function () {
    $document = privateDocument();

    $this->actingAs(User::factory()->create())
        ->get(route('documents.file', $document))
        ->assertForbidden();
});

test('a logged in user with a signed url can open the file', function () {
    $document = privateDocument();

    $this->actingAs(Assignment::findOrFail($document->uploaded_by)->user)
        ->get($document->signedFileUrl())
        ->assertOk()
        ->assertHeader('Cache-Control', 'max-age=0, no-store, private');
});

test('the migration moves existing public files to the private disk', function () {
    $document = privateDocument();
    Storage::disk('local')->delete($document->path);
    Storage::disk('public')->put($document->path, '%PDF-1.4 antiguo');

    $migration = require database_path('migrations/2026_11_02_000001_move_documents_to_private_storage.php');
    $migration->up();

    Storage::disk('local')->assertExists($document->path);
    Storage::disk('public')->assertMissing($document->path);
});
