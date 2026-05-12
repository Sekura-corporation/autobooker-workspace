// src/pages/client/clientData.ts
export interface AppointmentService {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface ClientAppointmentItem {
  id: string;
  service: string;
  vehicle: string;
  plate: string;
  duration: string;
  price: number;
  status: "waiting" | "in_progress" | "completed" | "cancelled";
  scheduledAt: string;
  storeName: string;
  hasPickup: boolean;
  loyaltyPoints: number;
  items: AppointmentService[];
}

export interface ClientRewardItem {
  id: string;
  name: string;
  points?: number;
  date: string;
  status?: string;
}

export interface ClientServiceItem {
  id: string;
  name: string;
  distance: string;
  rating: number;
  reviews: number;
}

export const clientAppointments: ClientAppointmentItem[] = [
  {
    id: "apt-1",
    service: "Lava Rápido Express",
    vehicle: "Jeep Compass (Preto)",
    plate: "ABC-1234",
    duration: "45 min",
    price: 89.9,
    status: "waiting",
    scheduledAt: "2024-04-22T14:00:00",
    storeName: "Imperium Auto Detail",
    hasPickup: true,
    loyaltyPoints: 50,
    items: [
      { id: "srv-1", name: "Lava Rápido Express", price: 89.9, quantity: 1 },
    ],
  },
  {
    id: "apt-2",
    service: "Polimento Premium",
    vehicle: "Toyota Corolla",
    plate: "XYZ-5678",
    duration: "2h",
    price: 199.9,
    status: "waiting",
    scheduledAt: "2024-04-24T10:00:00",
    storeName: "Speed Wash Premium",
    hasPickup: false,
    loyaltyPoints: 75,
    items: [
      { id: "srv-2", name: "Polimento Premium", price: 199.9, quantity: 1 },
    ],
  },
  {
    id: "apt-3",
    service: "Proteção Cerâmica",
    vehicle: "Honda Civic",
    plate: "DEF-9012",
    duration: "3h",
    price: 299.9,
    status: "waiting",
    scheduledAt: "2024-04-26T09:00:00",
    storeName: "Premium Plus Detailing",
    hasPickup: true,
    loyaltyPoints: 100,
    items: [
      { id: "srv-3", name: "Proteção Cerâmica", price: 299.9, quantity: 1 },
    ],
  },
  {
    id: "apt-4",
    service: "Hidratação de Couro",
    vehicle: "BMW 320i",
    plate: "GHI-3456",
    duration: "1h 30 min",
    price: 150.0,
    status: "completed",
    scheduledAt: "2024-04-20T15:00:00",
    storeName: "Imperium Auto Detail",
    hasPickup: false,
    loyaltyPoints: 60,
    items: [
      { id: "srv-4", name: "Hidratação de Couro", price: 150.0, quantity: 1 },
    ],
  },
  {
    id: "apt-5",
    service: "Limpeza Interna",
    vehicle: "Volkswagen Passat",
    plate: "JKL-7890",
    duration: "1h",
    price: 120.0,
    status: "completed",
    scheduledAt: "2024-04-19T11:00:00",
    storeName: "Speed Wash Premium",
    hasPickup: false,
    loyaltyPoints: 45,
    items: [
      { id: "srv-5", name: "Limpeza Interna", price: 120.0, quantity: 1 },
    ],
  },
  {
    id: "apt-6",
    service: "Enceramento",
    vehicle: "Jeep Compass (Preto)",
    plate: "ABC-1234",
    duration: "2h",
    price: 180.0,
    status: "completed",
    scheduledAt: "2024-04-18T14:00:00",
    storeName: "Premium Plus Detailing",
    hasPickup: true,
    loyaltyPoints: 70,
    items: [{ id: "srv-6", name: "Enceramento", price: 180.0, quantity: 1 }],
  },
];

export const clientRewards: ClientRewardItem[] = [
  {
    id: "reward-1",
    name: "Lavagem Premium",
    points: 50,
    date: "Há 15 dias • Imperium",
    status: "completed",
  },
  {
    id: "reward-2",
    name: "Polimento",
    points: 30,
    date: "Há 2 meses • Speed Wash",
    status: "completed",
  },
  {
    id: "reward-3",
    name: "Estética Completa",
    points: 100,
    date: "Há 3 meses • Premium Plus",
    status: "completed",
  },
];

export const clientServices: ClientServiceItem[] = [
  {
    id: "svc-1",
    name: "Imperium Auto Detail",
    distance: "A 2.5 km",
    rating: 4.9,
    reviews: 120,
  },
  {
    id: "svc-2",
    name: "Speed Wash Premium",
    distance: "A 3.8 km",
    rating: 4.7,
    reviews: 95,
  },
];
