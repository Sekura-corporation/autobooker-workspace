<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StoreReportController extends Controller
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

        $month = $request->input('month', now()->format('Y-m'));

        $startDate = $month . '-01';
        $endDate = date('Y-m-t', strtotime($startDate));

        $completedAppointments = Appointment::with('service')
            ->where('store_id', $store->id)
            ->where('status', 'completed')
            ->whereBetween('appointment_date', [$startDate, $endDate])
            ->get();

        $totalRevenue = $completedAppointments->sum('price');
        $completedCount = $completedAppointments->count();
        $averageTicket = $completedCount > 0
            ? $totalRevenue / $completedCount
            : 0;

        $dailyRevenue = Appointment::query()
            ->where('store_id', $store->id)
            ->where('status', 'completed')
            ->whereBetween('appointment_date', [$startDate, $endDate])
            ->select(
                'appointment_date',
                DB::raw('SUM(price) as total')
            )
            ->groupBy('appointment_date')
            ->orderBy('appointment_date')
            ->get()
            ->map(function ($item) {
                return [
                    'date' => $item->appointment_date,
                    'name' => date('d/m', strtotime($item->appointment_date)),
                    'total' => (float) $item->total,
                ];
            });

        $topServices = Appointment::query()
            ->join('services', 'appointments.service_id', '=', 'services.id')
            ->where('appointments.store_id', $store->id)
            ->where('appointments.status', 'completed')
            ->whereBetween('appointments.appointment_date', [$startDate, $endDate])
            ->select(
                'services.name',
                DB::raw('COUNT(appointments.id) as total')
            )
            ->groupBy('services.name')
            ->orderByDesc('total')
            ->limit(5)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'month' => $month,
                'totalRevenue' => $totalRevenue,
                'completedServices' => $completedCount,
                'averageTicket' => $averageTicket,
                'dailyRevenue' => $dailyRevenue,
                'topServices' => $topServices,
            ],
        ]);
    }
}