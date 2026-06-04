<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Store;
use Illuminate\Http\Request;
use App\Models\LoyaltyPoint;
use Illuminate\Support\Carbon;

class StoreAppointmentController extends Controller
{
    public function index(Request $request)
    {
        $storeIds = Store::where('owner_id', $request->user()->id)->pluck('id');

        $query = Appointment::with(['store', 'service', 'vehicle', 'client'])
            ->whereIn('store_id', $storeIds);

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('date')) {
            $query->whereDate('appointment_date', $request->input('date'));
        }

        $appointments = $query
            ->orderBy('appointment_date')
            ->orderBy('appointment_time')
            ->get();

        return response()->json(
            $appointments->map(fn(Appointment $appointment) => $this->appointmentJson($appointment))
        );
    }


    public function show(Request $request, Appointment $appointment)
    {
        $storeIds = Store::where('owner_id', $request->user()->id)->pluck('id');

        if (!$storeIds->contains($appointment->store_id)) {
            return response()->json(['message' => 'Acesso negado.'], 403);
        }

        $appointment->loadMissing(['store', 'service', 'vehicle', 'client']);

        return response()->json($this->appointmentJson($appointment));
    }

    public function updateStatus(Request $request, Appointment $appointment)
    {
        $storeIds = Store::where('owner_id', $request->user()->id)->pluck('id');

        if (!$storeIds->contains($appointment->store_id)) {
            return response()->json(['message' => 'Acesso negado.'], 403);
        }

        $validated = $request->validate([
            'status' => ['required', 'string', 'in:pending,waiting,in_progress,completed,cancelled'],
        ]);

        $oldStatus = $appointment->status;

        $appointment->status = $validated['status'];
        $appointment->save();

        if ($oldStatus !== 'completed' && $validated['status'] === 'completed') {
            $setting = \App\Models\LoyaltySetting::firstOrCreate(
                [
                    'store_id' => $appointment->store_id,
                ],
                [
                    'spent_value' => 1,
                    'points_value' => 1,
                ]
            );

            $price = (float) ($appointment->price ?? 0);

            $points = (int) floor(
                ($price / max(1, $setting->spent_value)) * $setting->points_value
            );

            if ($points > 0) {
                $loyalty = LoyaltyPoint::firstOrCreate(
                    [
                        'client_id' => $appointment->client_id,
                        'store_id' => $appointment->store_id,
                    ],
                    [
                        'points' => 0,
                    ]
                );

                $loyalty->increment('points', $points);
            }
        }

        $appointment->loadMissing(['store', 'service', 'vehicle', 'client']);

        return response()->json($this->appointmentJson($appointment));
    }

    private function appointmentJson(Appointment $appointment): array
    {
        $scheduledAt = null;

        if ($appointment->appointment_date && $appointment->appointment_time) {
            $date = Carbon::parse($appointment->appointment_date)->toDateString();
            $time = Carbon::parse($appointment->appointment_time)->format('H:i:s');
            $scheduledAt = Carbon::parse($date . ' ' . $time)->format('Y-m-d\TH:i:s');
        }

        $durationMinutes =
            optional($appointment->service)->duration_minutes
            ?? optional($appointment->service)->duration
            ?? 60;

        return [
            'id' => (string) $appointment->id,
            'scheduledAt' => $scheduledAt,
            'date' => $appointment->appointment_date,
            'time' => $appointment->appointment_time,
            'status' => $appointment->status,

            'customer' => optional($appointment->client)->name ?? 'Cliente',
            'customerEmail' => optional($appointment->client)->email,
            'customerPhone' => optional($appointment->client)->phone,

            'storeId' => (string) $appointment->store_id,
            'storeName' => optional($appointment->store)->name,

            'serviceId' => (string) $appointment->service_id,
            'service' => optional($appointment->service)->name ?? 'Serviço',
            'duration' => $durationMinutes . ' min',
            'price' => $appointment->price !== null
                ? (float) $appointment->price
                : (float) (optional($appointment->service)->price ?? 0),

            'vehicleId' => (string) $appointment->vehicle_id,
            'vehicle' => trim(
                (optional($appointment->vehicle)->brand ?? '') . ' ' .
                (optional($appointment->vehicle)->model ?? '')
            ) ?: 'Veículo',
            'plate' => optional($appointment->vehicle)->plate,
            'vehicleColor' => optional($appointment->vehicle)->color,
        ];
    }

    public function storeManual(Request $request)
    {
        $store = $request->user()->storesOwned()->first();

        if (!$store) {
            return response()->json([
                'success' => false,
                'message' => 'Loja não encontrada.'
            ], 404);
        }

        $data = $request->validate([
            'phone' => 'required|string',
            'vehicle_id' => 'required|exists:vehicles,id',
            'appointment_date' => 'required|date',
            'appointment_time' => 'required|string',
            'service_id' => 'required|exists:services,id',
        ]);

        $client = \App\Models\User::where('phone', $data['phone'])
            ->where('role', 'client')
            ->first();

        if (!$client) {
            return response()->json([
                'success' => false,
                'message' => 'Cliente não encontrado com esse telefone.'
            ], 404);
        }

        $service = \App\Models\Service::where('id', $data['service_id'])
            ->where('store_id', $store->id)
            ->first();

        if (!$service) {
            return response()->json([
                'success' => false,
                'message' => 'Serviço não pertence a esta loja.'
            ], 422);
        }

        $vehicle = \App\Models\Vehicle::where('id', $data['vehicle_id'])
            ->where('client_id', $client->id)
            ->first();

        if (!$vehicle) {
            return response()->json([
                'success' => false,
                'message' => 'Veículo não pertence a este cliente.'
            ], 422);
        }

        $alreadyBooked = Appointment::where('store_id', $store->id)
            ->whereDate('appointment_date', $data['appointment_date'])
            ->where('appointment_time', $data['appointment_time'])
            ->whereIn('status', ['pending', 'inProgress', 'waiting', 'in_progress'])
            ->exists();

        if ($alreadyBooked) {
            return response()->json([
                'success' => false,
                'message' => 'Horário já ocupado para esta data.'
            ], 422);
        }

        $appointment = Appointment::create([
            'client_id' => $client->id,
            'store_id' => $store->id,
            'vehicle_id' => $vehicle->id,
            'service_id' => $service->id,
            'appointment_date' => $data['appointment_date'],
            'appointment_time' => $data['appointment_time'],
            'status' => 'pending',
            'price' => $service->price,
            'notes' => 'Agendamento criado manualmente pelo lojista.',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Agendamento criado com sucesso.',
            'data' => $appointment->load(['client', 'vehicle', 'service']),
        ], 201);
    }

    public function findCustomerByPhone(Request $request)
    {
        $data = $request->validate([
            'phone' => 'required|string',
        ]);

        $client = \App\Models\User::where('phone', $data['phone'])
            ->where('role', 'client')
            ->with('vehicles')
            ->first();

        if (!$client) {
            return response()->json([
                'success' => false,
                'message' => 'Cliente não encontrado.'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $client->id,
                'name' => $client->name,
                'phone' => $client->phone,
                'vehicles' => $client->vehicles,
            ]
        ]);
    }
}