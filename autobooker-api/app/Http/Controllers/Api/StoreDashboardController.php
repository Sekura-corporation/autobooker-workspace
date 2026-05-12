<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class StoreDashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $store = $user->storesOwned()->first();

        if (!$store) {
            return response()->json([
                'success' => false,
                'message' => 'Loja não encontrada.'
            ], 404);
        }

        $today = Carbon::today()->toDateString();

        $appointments = Appointment::with([
            'client',
            'vehicle',
            'service'
        ])
        ->where('store_id', $store->id)
        ->get();

        // Agendamentos de hoje
        $todayAppointments = $appointments
            ->filter(function ($appointment) use ($today) {
                return Carbon::parse($appointment->appointment_date)->toDateString() === $today;
            })
            ->values();

        // Faturamento do mês
        $monthlyRevenue = $appointments
            ->filter(function ($appointment) {
                return $appointment->status === 'completed'
                    && Carbon::parse($appointment->appointment_date)->isCurrentMonth();
            })
            ->sum('price');

        // Clientes atendidos
        $servedClients = $appointments
            ->where('status', 'completed')
            ->pluck('client_id')
            ->unique()
            ->count();

        // Próximo agendamento
        $nextAppointment = $appointments
            ->filter(function ($appointment) use ($today) {
                return in_array($appointment->status, ['pending', 'inProgress'])
                    && Carbon::parse($appointment->appointment_date)->toDateString() >= $today;
            })
            ->sortBy(function ($appointment) {
                return Carbon::parse($appointment->appointment_date)->toDateString()
                    . ' '
                    . $appointment->appointment_time;
            })
            ->first();

        // Serviços recentes
        $recentServices = $appointments
            ->where('status', 'completed')
            ->sortByDesc('updated_at')
            ->take(5)
            ->values();

        return response()->json([
            'success' => true,

            'data' => [
                'monthlyRevenue' => $monthlyRevenue,

                'todayAppointmentsCount' => $todayAppointments->count(),

                'servedClients' => $servedClients,

                'nextAppointment' => $nextAppointment,

                'recentServices' => $recentServices,

                'todayAppointments' => $todayAppointments,
            ]
        ]);
    }
}