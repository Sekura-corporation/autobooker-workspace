<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Store;
use Illuminate\Http\Request;
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
            $appointments->map(fn (Appointment $appointment) => $this->appointmentJson($appointment))
        );
    }


    public function show(Request $request, Appointment $appointment)
    {
    $storeIds = Store::where('owner_id', $request->user()->id)->pluck('id');

    if (! $storeIds->contains($appointment->store_id)) {
        return response()->json(['message' => 'Acesso negado.'], 403);
    }

    $appointment->loadMissing(['store', 'service', 'vehicle', 'client']);

    return response()->json($this->appointmentJson($appointment));
    }
    
    public function updateStatus(Request $request, Appointment $appointment)
    {
        $storeIds = Store::where('owner_id', $request->user()->id)->pluck('id');

        if (! $storeIds->contains($appointment->store_id)) {
            return response()->json(['message' => 'Acesso negado.'], 403);
        }

        $validated = $request->validate([
            'status' => ['required', 'string', 'in:pending,waiting,in_progress,completed,cancelled'],
        ]);

        $appointment->status = $validated['status'];
        $appointment->save();

        $appointment->loadMissing(['store', 'service', 'vehicle', 'client']);

        return response()->json($this->appointmentJson($appointment));
    }

    private function appointmentJson(Appointment $appointment): array
    {
        $scheduledAt = null;

        if ($appointment->appointment_date && $appointment->appointment_time) {
            $date = Carbon::parse($appointment->appointment_date)->toDateString();
            $time = Carbon::parse($appointment->appointment_time)->format('H:i:s');
            $scheduledAt = Carbon::parse($date . ' ' . $time)->toISOString();
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
}