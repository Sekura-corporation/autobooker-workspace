<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;


class AppointmentController extends Controller
{
    public function index(Request $request)
    {
        $query = Appointment::query()->where('client_id', $request->user()->id);

        if ($status = $request->string('status')->toString()) {
            $query->where('status', $status);
        }

        if ($request->filled('dateFrom')) {
            $query->whereDate('appointment_date', '>=', $request->input('dateFrom'));
        }

        if ($request->filled('dateTo')) {
            $query->whereDate('appointment_date', '<=', $request->input('dateTo'));
        }

        $limit = (int) ($request->input('limit', 100));
        $appointments = $query->orderByDesc('appointment_date')->orderByDesc('appointment_time')
            ->limit(max(1, min($limit, 200)))
            ->get();

        return response()->json($appointments->map(fn(Appointment $a) => $this->appointmentJson($a)));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'storeId' => ['required'],
            'vehicleId' => ['nullable'],
            'serviceId' => ['nullable'],
            'packageId' => ['nullable'],
            'scheduledAt' => ['required', 'date'],
            'customerId' => ['nullable'],
            'notes' => ['nullable', 'string'],
            'status' => ['nullable', 'string'],
            'price' => ['nullable', 'numeric'],
        ]);

        $scheduled = Carbon::parse($validated['scheduledAt']);

        if ($scheduled->lessThan(now())) {
            return response()->json([
                'message' => 'Não é possível agendar para uma data ou horário passado.',
            ], 422);
        }

        $store = \App\Models\Store::find((int) $validated['storeId']);
        if (!$store) {
            return response()->json([
                'message' => 'Estética não encontrada.',
            ], 404);
        }

        $dayOfWeekMap = [
            0 => 'dom',
            1 => 'seg',
            2 => 'ter',
            3 => 'qua',
            4 => 'qui',
            5 => 'sex',
            6 => 'sab',
        ];
        $dayKey = $dayOfWeekMap[$scheduled->dayOfWeek] ?? 'seg';

        $openingHours = [];
        if ($store->opening_hours && is_string($store->opening_hours)) {
            $openingHours = json_decode($store->opening_hours, true) ?? [];
        }

        $dayConfig = $openingHours[$dayKey] ?? null;
        $capacity = 1;
        $requestedTime = $scheduled->format('H:i');

        if ($dayConfig && isset($dayConfig['open']) && $dayConfig['open']) {
            if (isset($dayConfig['slots']) && is_array($dayConfig['slots'])) {
                $foundSlot = false;
                foreach ($dayConfig['slots'] as $slot) {
                    $slotTime = $slot['time'] ?? '';
                    if (substr($slotTime, 0, 5) === $requestedTime) {
                        $capacity = (int) ($slot['capacity'] ?? 1);
                        $foundSlot = true;
                        break;
                    }
                }
                // Se o lojista definiu slots e o cliente enviou um horário que NÃO está na lista de slots, bloqueia
                if (!$foundSlot) {
                    return response()->json([
                        'message' => 'Horário indisponível para esta estética.',
                    ], 422);
                }
            } else {
                $capacity = 1;
            }
        } else {
            return response()->json([
                'message' => 'A estética está fechada neste dia.',
            ], 422);
        }

        if ($capacity < 1) {
            $capacity = 1;
        }

        $activeAppointmentsCount = Appointment::where('store_id', (int) $validated['storeId'])
            ->whereDate('appointment_date', $scheduled->toDateString())
            ->whereTime('appointment_time', $scheduled->format('H:i:s'))
            ->whereIn('status', ['pending', 'waiting', 'in_progress'])
            ->count();

        if ($activeAppointmentsCount >= $capacity) {
            return response()->json([
                'message' => 'Este horário atingiu o limite de vagas disponíveis. Escolha outro horário.',
            ], 422);
        }

        $appointment = Appointment::create([
            'client_id' => $request->user()->id,
            'store_id' => (int) $validated['storeId'],
            'vehicle_id' => $validated['vehicleId'] ? (int) $validated['vehicleId'] : 1,
            'service_id' => !empty($validated['serviceId'])
                ? (int) $validated['serviceId']
                : null,

            'package_id' => !empty($validated['packageId'])
                ? (int) $validated['packageId']
                : null,
            'appointment_date' => $scheduled->toDateString(),
            'appointment_time' => $scheduled->format('H:i:s'),
            'status' => $validated['status'] ?? 'pending',
            'price' => $validated['price'] ?? null,
            'notes' => $validated['notes'] ?? null,
        ]);

        return response()->json($this->appointmentJson($appointment), 201);
    }

    public function update(Request $request, Appointment $appointment)
    {
        if ((int) $appointment->client_id !== (int) $request->user()->id) {
            return response()->json(['message' => 'Acesso negado'], 403);
        }

        $validated = $request->validate([
            'scheduledAt' => ['sometimes', 'date'],
            'status' => ['sometimes', 'string'],
            'notes' => ['sometimes', 'nullable', 'string'],
            'price' => ['sometimes', 'nullable', 'numeric'],
        ]);

        if (array_key_exists('scheduledAt', $validated)) {
            $scheduled = Carbon::parse($validated['scheduledAt']);
            $appointment->appointment_date = $scheduled->toDateString();
            $appointment->appointment_time = $scheduled->format('H:i:s');
        }

        if (array_key_exists('status', $validated)) {
            $appointment->status = $validated['status'];
        }

        if (array_key_exists('notes', $validated)) {
            $appointment->notes = $validated['notes'];
        }

        if (array_key_exists('price', $validated)) {
            $appointment->price = $validated['price'];
        }

        $appointment->save();

        return response()->json($this->appointmentJson($appointment));
    }

    private function appointmentJson(Appointment $appointment): array
    {
        $appointment->loadMissing(['store.owner', 'vehicle', 'service', 'package']);

        $scheduledAt = null;

        if ($appointment->appointment_date && $appointment->appointment_time) {
            $date = Carbon::parse($appointment->appointment_date)->toDateString();
            $time = Carbon::parse($appointment->appointment_time)->format('H:i:s');

            $scheduledAt = Carbon::parse($date . ' ' . $time)->format('Y-m-d\TH:i:s');
        }

        return [
            'id' => (string) $appointment->id,
            'customerId' => (string) $appointment->client_id,
            'storeId' => (string) $appointment->store_id,
            'vehicleId' => (string) $appointment->vehicle_id,
            'serviceId' => $appointment->service_id ? (string) $appointment->service_id : null,
            'packageId' => $appointment->package_id ? (string) $appointment->package_id : null,
            'scheduledAt' => $scheduledAt,
            'status' => $appointment->status,
            'storePhone' => optional($appointment->store->owner)->phone ?? optional($appointment->store)->phone,

            'storeName' => optional($appointment->store)->name ?? 'Loja selecionada',
            'service' =>
                optional($appointment->package)->name
                ?? optional($appointment->service)->name
                ?? 'Serviço agendado',
            'vehicle' => trim((optional($appointment->vehicle)->brand ?? '') . ' ' . (optional($appointment->vehicle)->model ?? '')),
            'plate' => optional($appointment->vehicle)->plate ?? '',
            'duration' => $appointment->package_id
                ? 'Pacote VIP'
                : (
                    optional($appointment->service)->duration_minutes
                        ? optional($appointment->service)->duration_minutes . ' min'
                        : '60 min'
                ),
            'price' => $appointment->price !== null
                ? (float) $appointment->price
                : (float) (
                    optional($appointment->package)->price
                    ?? optional($appointment->service)->price
                    ?? 0
                ),

            'notes' => $appointment->notes,
            'createdAt' => optional($appointment->created_at)->toISOString(),
            'updatedAt' => optional($appointment->updated_at)->toISOString(),
        ];
    }
}

