<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StoreCustomerController extends Controller
{
    public function index(Request $request)
    {
        $store = $request->user()->storesOwned()->first();

        if (!$store) {
            return response()->json([
                'success' => false,
                'message' => 'Loja não encontrada.'
            ], 404);
        }

        $customers = DB::table('store_customers')
            ->join('users', 'store_customers.client_id', '=', 'users.id')
            ->leftJoin('appointments', function ($join) use ($store) {
                $join->on('appointments.client_id', '=', 'users.id')
                    ->where('appointments.store_id', '=', $store->id);
            })
            ->where('store_customers.store_id', $store->id)
            ->select(
                'users.id',
                'users.name',
                'users.email',
                'users.phone',
                DB::raw('COUNT(appointments.id) as appointments_count'),
                DB::raw('COALESCE(SUM(appointments.price), 0) as total_spent'),
                DB::raw('MAX(appointments.appointment_date) as last_appointment')
            )
            ->groupBy('users.id', 'users.name', 'users.email', 'users.phone')
            ->orderByDesc('last_appointment')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $customers
        ]);
    }

    public function show(Request $request, $clientId)
    {
        $store = $request->user()->storesOwned()->first();

        if (!$store) {
            return response()->json([
                'success' => false,
                'message' => 'Loja não encontrada.'
            ], 404);
        }

        $appointments = \App\Models\Appointment::with(['client', 'vehicle', 'service'])
            ->where('store_id', $store->id)
            ->where('client_id', $clientId)
            ->orderByDesc('appointment_date')
            ->get();

        if ($appointments->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Cliente não encontrado nesta loja.'
            ], 404);
        }

        $client = $appointments->first()->client;

        $vehicles = $appointments
            ->pluck('vehicle')
            ->filter()
            ->unique('id')
            ->values()
            ->map(function ($vehicle) {
                return [
                    'id' => $vehicle->id,
                    'brand' => $vehicle->brand ?? '',
                    'model' => $vehicle->model ?? '',
                    'plate' => $vehicle->plate ?? '',
                ];
            });

        $totalSpent = $appointments->sum('price');
        $appointmentsCount = $appointments->count();
        $avgTicket = $appointmentsCount > 0 ? $totalSpent / $appointmentsCount : 0;
            
        $loyaltyPoints = \App\Models\LoyaltyPoint::where('client_id', $client->id)
            ->where('store_id', $store->id)
            ->value('points') ?? 0;

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $client->id,
                'name' => $client->name,
                'email' => $client->email,
                'phone' => $client->phone,
                'vehicles' => $vehicles,
                'loyalty_points' => $loyaltyPoints,
                'appointments_count' => $appointmentsCount,
                'total_spent' => $totalSpent,
                'avg_ticket' => $avgTicket,
                'last_visit' => optional($appointments->first()->appointment_date)->toDateString(),
                'history' => $appointments->map(function ($appointment) {
                    return [
                        'id' => $appointment->id,
                        'date' => optional($appointment->appointment_date)->toDateString(),
                        'time' => $appointment->appointment_time,
                        'service' => $appointment->service?->name ?? 'Serviço não informado',
                        'vehicle' => $appointment->vehicle
                            ? trim(($appointment->vehicle->brand ?? '') . ' ' . ($appointment->vehicle->model ?? ''))
                            : 'Veículo não informado',
                        'plate' => $appointment->vehicle?->plate,
                        'value' => $appointment->price,
                        'status' => $appointment->status,
                    ];
                }),
            ]
        ]);
    }

    public function store(Request $request)
    {
        $store = $request->user()->storesOwned()->first();

        if (!$store) {
            return response()->json([
                'success' => false,
                'message' => 'Loja não encontrada.'
            ], 404);
        }

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'plate' => 'nullable|string|max:20',
        ]);

        $client = \App\Models\User::firstOrCreate(
            [
                'phone' => $data['phone'],
                'role' => 'client',
            ],
            [
                'name' => $data['name'],
                'email' => 'cliente_' . time() . '@autobooker.local',
                'password' => bcrypt('12345678'),
            ]
        );

        DB::table('store_customers')->updateOrInsert(
            [
                'store_id' => $store->id,
                'client_id' => $client->id,
            ],
            [
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        if (!empty($data['plate'])) {
            \App\Models\Vehicle::firstOrCreate(
                [
                    'client_id' => $client->id,
                    'plate' => strtoupper($data['plate']),
                ],
                [
                    'brand' => '',
                    'model' => 'Veículo cadastrado no balcão',
                    'color' => '',
                ]
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Cliente cadastrado com sucesso.',
            'data' => $client->load('vehicles'),
        ], 201);
    }
}