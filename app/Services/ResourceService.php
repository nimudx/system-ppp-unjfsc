<?php

namespace App\Services;

use App\Models\Company;
use App\Models\Faculty;
use App\Models\Resource;
use App\Models\School;
use App\Models\Section;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class ResourceService
{
    protected $documentService;

    public function __construct(DocumentService $documentService)
    {
        $this->documentService = $documentService;
    }

    /**
     * Store a resource.
     */
    public function storeResource(array $data, Model $uploader): Resource
    {
        return DB::transaction(function () use ($data, $uploader) {
            $resource = Resource::query()->create([
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
                'uploader_id' => $uploader->id,
                'uploader_type' => $uploader->getMorphClass(),
                'role_id' => $data['role_id'],
                'level' => $data['level'],
                'document_type_id' => $data['document_type_id'],
                'location_id' => $data['location_id'] ?? null,
                'location_type' => $data['location_type'] ?? null,
                'semester_id' => $data['semester_id'] ?? null,
            ]);

            $this->documentService->registerDocument([
                'name' => $data['name'],
                'file' => $data['file'],
                'document_type_id' => $data['document_type_id'],
                'context' => 'resource',
            ], $uploader, $resource);

            return $resource->load('documents');
        });
    }

    /**
     * List resources for a user based on role, semester, and locations.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function listResourcesForUser(int $roleId, ?int $semesterId, array $locations = [])
    {
        $query = Resource::query()->where(function ($q) use ($roleId) {
            $q->where('role_id', $roleId)->orWhereNull('role_id');
        })
            ->where('status', 1)
            ->where(function ($q) use ($semesterId) {
                $q->where('semester_id', $semesterId)->orWhereNull('semester_id');
            });

        $query->where(function ($q) use ($locations) {
            $q->where('level', 1);

            foreach ($locations as $loc) {
                if (! isset($loc['type']) || ! isset($loc['id'])) {
                    continue;
                }

                $q->orWhere(function ($q) use ($loc) {
                    $q->where('location_type', $loc['type'])
                        ->where('location_id', $loc['id']);
                });
            }
        });

        return $query->with('documents')->get();
    }

    public function registerResourceAcademic(Model $uploader, array $data): void
    {
        DB::transaction(function () use ($uploader, $data) {
            $levelModels = [
                2 => Faculty::class,
                3 => School::class,
                4 => Section::class,
                5 => Company::class,
            ];
            $data['location_type'] = $levelModels[$data['level']] ?? null;

            // Si role_id es null, es un recurso público de sistema
            if (is_null($data['role_id'])) {
                $data['level'] = 1; // Forzamos Global
                $data['location_id'] = null;
                $data['location_type'] = null;
            }

            $this->storeResource($data, $uploader);
        });
    }

    /**
     * Update a resource and optionally its document.
     */
    public function updateResource(Resource $resource, array $data, Model $uploader): Resource
    {
        return DB::transaction(function () use ($resource, $data, $uploader) {
            $resource->update([
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
            ]);

            if (isset($data['file'])) {
                // Eliminar el documento anterior si existe
                foreach ($resource->documents as $document) {
                    $this->documentService->removerDocument($document);
                }

                // Registrar el nuevo documento
                $this->documentService->registerDocument([
                    'name' => $data['name'],
                    'file' => $data['file'],
                    'document_type_id' => $resource->document_type_id,
                    'context' => 'resource',
                ], $uploader, $resource);
            }

            return $resource->load('documents');
        });
    }

    /**
     * Delete a resource and its associated documents.
     */
    public function deleteResource(Resource $resource): void
    {
        DB::transaction(function () use ($resource) {
            // Eliminar documentos asociados (físico y base de datos)
            foreach ($resource->documents as $document) {
                $this->documentService->removerDocument($document);
            }

            // Eliminar el recurso
            $resource->delete();
        });
    }
}
