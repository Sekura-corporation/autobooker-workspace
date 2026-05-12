<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    public function index(Request $request)
    {
        $query = Service::query();

        if ($request->has('active')) {
            $query->where('status', $request->boolean('active'));
        }

        if ($search = $request->string('search')->toString()) {
            $query->where('name', 'ilike', "%{$search}%");
        }

        $limit = (int) ($request->input('limit', 100));
        $services = $query->orderByDesc('id')->limit(max(1, min($limit, 200)))->get();

        return response()->json($services->map(fn (Service $s) => $this->serviceJson($s)));
    }

    public function show(Service $service)
    {
        return response()->json($this->serviceJson($service));
    }

    private function serviceJson(Service $service): array
    {
        return [
            'id' => (string) $service->id,
            'storeId' => (string) $service->store_id,
            'name' => $service->name,
            'price' => (float) $service->price,
            'durationMinutes' => (int) $service->duration_minutes,
            'active' => (bool) $service->status,
            'createdAt' => optional($service->created_at)->toISOString(),
            'updatedAt' => optional($service->updated_at)->toISOString(),
        ];
    }
}

