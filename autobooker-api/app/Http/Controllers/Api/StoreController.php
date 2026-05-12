<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\Store;
use Illuminate\Http\Request;
use App\Models\Appointment;

class StoreController extends Controller
{
    public function index(Request $request)
    {
        $query = Store::query();

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('name', 'ilike', "%{$search}%");
        }

        if ($request->has('status')) {
            $status = $request->input('status');

            if ($status == 'active' || $status == 1 || $status === true) {
                $query->where('status', true);
            } elseif ($status == 'inactive' || $status == 0 || $status === false) {
                $query->where('status', false);
            }
        }

        $limit = (int) $request->input('limit', 50);
        $stores = $query->orderByDesc('id')->limit($limit)->get();

        return response()->json($stores->map(function ($store) {
            return $this->storeJson($store);
        }));
    }

    public function show(Store $store)
    {
        return response()->json($this->storeJson($store));
    }

    public function services(Store $store, Request $request)
    {
        $query = Service::where('store_id', $store->id);

        if ($request->has('active')) {
            $query->where('status', $request->boolean('active'));
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('name', 'ilike', "%{$search}%");
        }

        $services = $query->orderByDesc('id')->get();

        return response()->json($services->map(function ($service) {
            return $this->serviceJson($service);
        }));
    }

    private function storeJson($store): array
    {
    return [
        'id' => (string) $store->id,
        'name' => $store->name,
        'cnpj' => $store->cnpj,
        'ownerId' => $store->owner_id ? (string) $store->owner_id : null,
        'status' => (bool) $store->status,

        'phone' => $store->phone,
        'email' => $store->email,
        'address' => $store->address,
        'city' => $store->city,
        'state' => $store->state,
        'zip_code' => $store->zip_code,
        'description' => $store->description,
        'opening_hours' => $store->opening_hours,

        'createdAt' => $store->created_at ? $store->created_at->toISOString() : null,
        'updatedAt' => $store->updated_at ? $store->updated_at->toISOString() : null,
    ];
    }

    private function serviceJson($service): array
    {
        return [
            'id' => (string) $service->id,
            'storeId' => (string) $service->store_id,
            'name' => $service->name,
            'price' => (float) $service->price,
            'durationMinutes' => (int) $service->duration_minutes,
            'active' => (bool) $service->status,
            'createdAt' => $service->created_at ? $service->created_at->toISOString() : null,
            'updatedAt' => $service->updated_at ? $service->updated_at->toISOString() : null,
        ];
    }

    public function bookedTimes(Request $request, Store $store)
    {
    $validated = $request->validate([
        'date' => ['required', 'date'],
    ]);

    $times = Appointment::where('store_id', $store->id)
        ->whereDate('appointment_date', $validated['date'])
        ->whereIn('status', ['pending', 'waiting', 'in_progress'])
        ->pluck('appointment_time')
        ->map(fn ($time) => substr($time, 0, 5))
        ->values();

    return response()->json($times);
    }
}
