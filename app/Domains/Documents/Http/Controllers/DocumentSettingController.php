<?php

namespace App\Domains\Documents\Http\Controllers;

use App\Domains\Documents\Models\DocumentType;
use App\Domains\Identity\Models\Role;
use App\Shared\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DocumentSettingController extends Controller
{
    public function index(): Response
    {
        $documentTypes = DocumentType::with('roles')->get();
        $roles = Role::where('status', 1)->get();

        return Inertia::render('documents/settings/index', [
            'documentTypes' => $documentTypes,
            'roles' => $roles,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:document_types,code',
            'description' => 'nullable|string',
            'roles' => 'required|array',
            'roles.*' => 'exists:roles,id',
        ]);

        $documentType = DocumentType::create([
            'name' => $validated['name'],
            'code' => $validated['code'],
            'description' => $validated['description'],
            'status' => 1,
        ]);

        if (! empty($validated['roles'])) {
            $documentType->roles()->sync($validated['roles']);
        }

        return back()->with('message', 'Tipo de documento registrado correctamente.');
    }

    public function update(Request $request, DocumentType $document): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:document_types,code,'.$document->id,
            'description' => 'nullable|string',
            'roles' => 'required|array',
            'roles.*' => 'exists:roles,id',
        ]);

        $document->update([
            'name' => $validated['name'],
            'code' => $validated['code'],
            'description' => $validated['description'],
        ]);

        if (isset($validated['roles'])) {
            $document->roles()->sync($validated['roles']);
        }

        return back()->with('message', 'Tipo de documento actualizado correctamente.');
    }

    public function destroy(DocumentType $document): RedirectResponse
    {
        // First detach roles
        $document->roles()->detach();

        $document->delete();

        return back()->with('message', 'Tipo de documento eliminado correctamente.');
    }
}
