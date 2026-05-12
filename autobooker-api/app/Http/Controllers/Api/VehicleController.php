<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use Illuminate\Http\Request;

class VehicleController extends Controller
{
    public function index(Request $request)
    {
        $query = Vehicle::query()->where('client_id', $request->user()->id);

        if ($search = $request->string('search')->toString()) {
            $query->where(function ($q) use ($search) {
                $q->where('model', 'ilike', "%{$search}%")
                    ->orWhere('brand', 'ilike', "%{$search}%")
                    ->orWhere('plate', 'ilike', "%{$search}%");
            });
        }

        $limit = (int) ($request->input('limit', 100));
        $vehicles = $query->orderByDesc('id')->limit(max(1, min($limit, 200)))->get();

        return response()->json($vehicles->map(fn (Vehicle $v) => $this->vehicleJson($v)));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'plate' => ['required', 'string', 'max:50'],
            'model' => ['nullable', 'string', 'max:255'],
            'type' => ['nullable', 'string', 'max:50'],
            // customerId is accepted for frontend compatibility but ignored in MVP
            'customerId' => ['nullable'],
        ]);

        $vehicle = Vehicle::create([
            'client_id' => $request->user()->id,
            'brand' => $request->input('brand', 'N/A'),
            'model' => $validated['model'] ?? 'N/A',
            'plate' => $validated['plate'],
            'year' => $request->input('year'),
            'color' => $request->input('color'),
            'notes' => $request->input('notes'),
        ]);

        return response()->json($this->vehicleJson($vehicle), 201);
    }

    public function update(Request $request, Vehicle $vehicle)
    {
        if ((int) $vehicle->client_id !== (int) $request->user()->id) {
            return response()->json(['message' => 'Acesso negado'], 403);
        }

        $validated = $request->validate([
            'plate' => ['sometimes', 'string', 'max:50'],
            'model' => ['sometimes', 'nullable', 'string', 'max:255'],
            'type' => ['sometimes', 'nullable', 'string', 'max:50'],
            'customerId' => ['sometimes', 'nullable'],
        ]);

        $vehicle->fill([
            'plate' => $validated['plate'] ?? $vehicle->plate,
            'model' => array_key_exists('model', $validated) ? ($validated['model'] ?? 'N/A') : $vehicle->model,
        ]);

        // Optionally accept extra fields if UI sends them
        foreach (['brand', 'year', 'color', 'notes'] as $field) {
            if ($request->has($field)) {
                $vehicle->{$field} = $request->input($field);
            }
        }

        $vehicle->save();

        return response()->json($this->vehicleJson($vehicle));
    }

    public function destroy(Request $request, Vehicle $vehicle)
    {
        if ((int) $vehicle->client_id !== (int) $request->user()->id) {
            return response()->json(['message' => 'Acesso negado'], 403);
        }

        $vehicle->delete();

        return response()->json(['success' => true]);
    }

    private function vehicleJson(Vehicle $vehicle): array
    {
        return [
            'id' => (string) $vehicle->id,
            'customerId' => (string) $vehicle->client_id,
            'plate' => $vehicle->plate,
            'model' => $vehicle->model,
            'type' => null,
            'brand' => $vehicle->brand,
            'year' => $vehicle->year,
            'color' => $vehicle->color,
            'notes' => $vehicle->notes,
            'createdAt' => optional($vehicle->created_at)->toISOString(),
            'updatedAt' => optional($vehicle->updated_at)->toISOString(),
        ];
    }
}

