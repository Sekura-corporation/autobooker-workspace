<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\StockItem;
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

        $today = now()->toDateString();

        $appointments = Appointment::with([
            'client',
            'vehicle',
            'service'
        ])
            ->where('store_id', $store->id)
            ->get();

        $todayAppointments = Appointment::with(['client', 'vehicle', 'service'])
            ->where('store_id', $store->id)
            ->whereDate('appointment_date', now()->toDateString())
            ->whereIn('status', ['pending', 'waiting', 'in_progress'])
            ->orderBy('appointment_time')
            ->get();

        if ($todayAppointments->isEmpty()) {
            $todayAppointments = Appointment::with(['client', 'vehicle', 'service'])
                ->where('store_id', $store->id)
                ->whereDate('appointment_date', '>', now()->toDateString())
                ->whereIn('status', ['pending', 'waiting', 'in_progress'])
                ->orderBy('appointment_date')
                ->orderBy('appointment_time')
                ->limit(5)
                ->get();
        }

        $monthlyRevenue = Appointment::where('store_id', $store->id)
            ->where('status', 'completed')
            ->whereYear('appointment_date', now()->year)
            ->whereMonth('appointment_date', now()->month)
            ->sum('price');

        $servedClients = $appointments
            ->where('status', 'completed')
            ->pluck('client_id')
            ->unique()
            ->count();

        $nextAppointment = $appointments
            ->filter(function ($appointment) use ($today) {
                return in_array($appointment->status, ['pending', 'waiting', 'in_progress'])
                    && Carbon::parse($appointment->appointment_date)->toDateString() >= $today;
            })
            ->sortBy(function ($appointment) {
                return Carbon::parse($appointment->appointment_date)->toDateString()
                    . ' '
                    . $appointment->appointment_time;
            })
            ->first();

        $recentServices = $appointments
            ->where('status', 'completed')
            ->sortByDesc('updated_at')
            ->take(5)
            ->values();

        $lowStockCount = StockItem::where('store_id', $store->id)
            ->whereColumn('quantity', '<=', 'min_quantity')
            ->count();

        return response()->json([
            'success' => true,
            'data' => [
                'store' => $store,
                'monthlyRevenue' => $monthlyRevenue,
                'todayAppointmentsCount' => $todayAppointments->count(),
                'servedClients' => $servedClients,
                'lowStockCount' => $lowStockCount,
                'nextAppointment' => $nextAppointment,
                'recentServices' => $recentServices,
                'todayAppointments' => $todayAppointments,
            ]
        ]);
    }
}