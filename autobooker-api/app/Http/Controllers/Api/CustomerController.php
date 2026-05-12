<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $query = Customer::query();

        if ($search = $request->string('search')->toString()) {
            $query->where('name', 'ilike', "%{$search}%")
                ->orWhere('email', 'ilike', "%{$search}%")
                ->orWhere('phone', 'ilike', "%{$search}%");
        }

        $limit = (int) ($request->input('limit', 100));
        $customers = $query->orderByDesc('id')->limit(max(1, min($limit, 200)))->get();

        return response()->json($customers->map(fn (Customer $c) => $this->customerJson($c)));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
        ]);

        $customer = Customer::create($validated);

        return response()->json($this->customerJson($customer), 201);
    }

    private function customerJson(Customer $customer): array
    {
        return [
            'id' => (string) $customer->id,
            'name' => $customer->name,
            'email' => $customer->email,
            'phone' => $customer->phone,
            'createdAt' => optional($customer->created_at)->toISOString(),
            'updatedAt' => optional($customer->updated_at)->toISOString(),
        ];
    }
}

