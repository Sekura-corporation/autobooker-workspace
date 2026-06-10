<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\Store;
use Illuminate\Http\Request;
use App\Models\Appointment;
use App\Models\PackageModel;

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
            $query->where('status', $status);
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
        'status' => $store->status,

        'phone' => $store->phone,
        'email' => $store->email,
        'address' => $store->address,
        'city' => $store->city,
        'state' => $store->state,
        'zip_code' => $store->zip_code,
        'description' => $store->description,
        'opening_hours' => $store->opening_hours,
        'logo_url' => $store->logo_url,
        'banner_url' => $store->banner_url,

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

        $carbonDate = \Illuminate\Support\Carbon::parse($validated['date']);
        $dayOfWeekMap = [
            0 => 'dom',
            1 => 'seg',
            2 => 'ter',
            3 => 'qua',
            4 => 'qui',
            5 => 'sex',
            6 => 'sab',
        ];
        $dayKey = $dayOfWeekMap[$carbonDate->dayOfWeek] ?? 'seg';

        $openingHours = [];
        if ($store->opening_hours && is_string($store->opening_hours)) {
            $openingHours = json_decode($store->opening_hours, true) ?? [];
        }

        $dayConfig = $openingHours[$dayKey] ?? null;
        $slots = [];

        if ($dayConfig && isset($dayConfig['open']) && $dayConfig['open']) {
            if (isset($dayConfig['slots']) && is_array($dayConfig['slots'])) {
                $slots = $dayConfig['slots'];
            } else {
                $defaultTimes = ["09:00", "10:30", "14:00", "15:30", "16:45"];
                foreach ($defaultTimes as $time) {
                    $slots[] = ['time' => $time, 'capacity' => 1];
                }
            }
        }

        $appointments = Appointment::where('store_id', $store->id)
            ->whereDate('appointment_date', $validated['date'])
            ->whereIn('status', ['pending', 'waiting', 'in_progress'])
            ->pluck('appointment_time')
            ->map(fn ($time) => substr($time, 0, 5))
            ->toArray();

        $appointmentCounts = array_count_values($appointments);

        $bookedTimes = [];
        foreach ($slots as $slot) {
            $time = $slot['time'] ?? '';
            $capacity = (int) ($slot['capacity'] ?? 1);
            if ($capacity < 1) {
                $capacity = 1;
            }
            $count = $appointmentCounts[$time] ?? 0;
            if ($count >= $capacity) {
                $bookedTimes[] = $time;
            }
        }

        return response()->json($bookedTimes);
    }

    public function rewards(Store $store)
    {
        $rewards = \App\Models\LoyaltyReward::where('store_id', $store->id)
            ->where('active', true)
            ->orderBy('points_cost')
            ->get();

        return response()->json($rewards);
    }

    public function products(Store $store)
    {
        $products = \App\Models\StockItem::where('store_id', $store->id)
            ->where('type', 'product')
            ->where('quantity', '>', 0)
            ->whereNotNull('sale_price')
            ->orderBy('name')
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'name' => $item->name,
                    'price' => $item->sale_price,
                    'quantity' => $item->quantity,
                ];
            });

        return response()->json($products);
    }

    public function packages(Store $store)
    {
        $packages = PackageModel::where('store_id', $store->id)
            ->orderBy('name')
            ->get()
            ->map(function ($package) {
                return [
                    'id' => $package->id,
                    'name' => $package->name,
                    'description' => $package->description,
                    'price' => (float) $package->price,
                    'sessions' => $package->sessions,
                    'validity_days' => $package->validity_days,
                ];
            });

        return response()->json($packages);
    }
}
