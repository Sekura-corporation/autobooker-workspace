import api from "@/services/api";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { listVehicles } from "@/services/vehicles.service";
import { useNavigate } from "react-router-dom";
import { createAppointment } from "@/services/appointments.service";
import { useCart } from "@/context/useCart";
import { ROLE_BASE_PATHS } from "@/utils/constants";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
  ArrowLeft,
  ChevronRight,
  CheckCircle,
  Car,
  Calendar,
  Truck,
  AlertCircle,
} from "lucide-react";

interface Vehicle {
  id: string;
  name: string;
  plate: string;
}

interface CheckoutData {
  vehicle: Vehicle | null;
  date: string;
  time: string;
  pickupRequired: boolean;
}

export default function Checkout() {
  const navigate = useNavigate();
  const { items, storeInfo, getTotal, clearCart } = useCart();
  const hasProducts = items.some((item) => item.type === "product");

  const hasAppointmentItem = items.some(
    (item) => item.type === "service" || item.type === "package"
  );

  const hasOnlyProducts = items.length > 0 && hasProducts && !hasAppointmentItem;

  const canUsePickup = hasAppointmentItem && !hasOnlyProducts;
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    vehicle: null,
    date: "",
    time: "",
    pickupRequired: false,
  });

  // Mock de veículos (depois virá da API)
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const [loyaltyRule, setLoyaltyRule] = useState({
    spentValue: 1,
    pointsValue: 1,
  });
  const [storeOpeningHours, setStoreOpeningHours] = useState<any>(null);

  useEffect(() => {
    async function fetchStoreDetails() {
      if (!storeInfo?.id) {
        return;
      }
      try {
        const { data } = await api.get(`/stores/${storeInfo.id}`);
        if (data && data.opening_hours) {
          try {
            setStoreOpeningHours(JSON.parse(data.opening_hours));
          } catch (e) {
            console.error("Erro ao fazer parse dos horários da loja:", e);
          }
        }
      } catch (error) {
        console.error("Erro ao buscar detalhes da loja:", error);
      }
    }
    fetchStoreDetails();
  }, [storeInfo?.id]);

  useEffect(() => {
    async function fetchVehicles() {
      const data = await listVehicles();
  
      setVehicles(
        data.map((vehicle: any) => ({
          id: String(vehicle.id),
          name: `${vehicle.brand ?? "Veículo"} ${vehicle.model ?? ""} (${vehicle.color ?? "Sem cor"})`,
          plate: vehicle.plate ?? "",
        })),
      );
    }
  
    fetchVehicles();
  }, []);

  useEffect(() => {
    async function fetchLoyaltyRule() {
      if (!storeInfo?.id) {
        return;
      }
  
      try {
        const { data } = await api.get(`/stores/${storeInfo.id}/loyalty`);
  
        setLoyaltyRule({
          spentValue: Number(data.data.rule.spent_value || 1),
          pointsValue: Number(data.data.rule.points_value || 1),
        });
      } catch (error) {
        console.error("Erro ao buscar regra de fidelidade:", error);
      }
    }
  
    fetchLoyaltyRule();
  }, [storeInfo?.id]);

  useEffect(() => {
    async function fetchBookedTimes() {
      const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(checkoutData.date);
  
      if (!storeInfo?.id || !isValidDate) {
        setBookedTimes([]);
        return;
      }
  
      try {
        const { data } = await api.get(`/stores/${storeInfo.id}/booked-times`, {
          params: {
            date: checkoutData.date,
          },
        });
  
        setBookedTimes(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Erro ao buscar horários ocupados:", error);
        setBookedTimes([]);
      }
    }
  
    fetchBookedTimes();
  }, [storeInfo?.id, checkoutData.date]);

  useEffect(() => {
    if (hasOnlyProducts) {
      setStep(3);
      setCheckoutData((prev) => ({
        ...prev,
        vehicle: null,
        date: "",
        time: "",
        pickupRequired: false,
      }));
    }
  }, [hasOnlyProducts]);

  
  const now = new Date();

  const today =
    now.getFullYear() +
    "-" +
    String(now.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(now.getDate()).padStart(2, "0");

  const currentTime =
    String(now.getHours()).padStart(2, "0") +
    ":" +
    String(now.getMinutes()).padStart(2, "0");

  const getDynamicSlots = () => {
    if (!checkoutData.date) return [];
    
    const dateParts = checkoutData.date.split("-");
    if (dateParts.length !== 3) return [];
    
    const selectedDate = new Date(
      Number(dateParts[0]),
      Number(dateParts[1]) - 1,
      Number(dateParts[2])
    );
    
    const dayOfWeekMap = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"];
    const dayKey = dayOfWeekMap[selectedDate.getDay()];
    
    if (!storeOpeningHours) {
      return ["09:00", "10:30", "14:00", "15:30", "16:45"];
    }
    
    const dayConfig = storeOpeningHours[dayKey];
    if (!dayConfig || !dayConfig.open) {
      return [];
    }
    
    if (dayConfig.slots && Array.isArray(dayConfig.slots)) {
      return dayConfig.slots.map((s: any) => s.time);
    }
    
    return ["09:00", "10:30", "14:00", "15:30", "16:45"];
  };

  const storeTimeSlots = getDynamicSlots();

  const availableTimes = storeTimeSlots.filter((time) => {
    const isBooked = bookedTimes.includes(time);
    const isPastTimeToday =
      checkoutData.date === today && time <= currentTime;

    return !isBooked && !isPastTimeToday;
  });

  // Custo de coleta
  const pickupCost = 25;
  const total = getTotal();
  const serviceFee = total * 0.1;
  const pickupTotal =
  checkoutData.pickupRequired && canUsePickup ? pickupCost : 0;
  const finalTotal = total + serviceFee + pickupTotal;
  const loyaltyPoints = Math.floor(
    (finalTotal / loyaltyRule.spentValue) * loyaltyRule.pointsValue
  );

  if (items.length === 0) {
    return (
      <div className="flex flex-col gap-8 w-full max-w-none">
        <p className="text-gray-600">Seu carrinho está vazio.</p>
        <Button
          onClick={() =>
            navigate(`/${ROLE_BASE_PATHS.client}/novo-agendamento`)
          }
        >
          Voltar para Empresas
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-none">
      {/* HEADER */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
            Checkout de Serviço
          </h1>
          {storeInfo && (
            <p className="text-gray-600 mt-2 font-medium">{storeInfo.name}</p>
          )}
        </div>
        <Button
          variant="outline"
          className="w-max text-red-600 border-red-300 hover:bg-red-50"
          onClick={() =>
            navigate(`/${ROLE_BASE_PATHS.client}/agendamento/carrinho`)
          }
        >
          Cancelar
        </Button>
      </div>

      {/* PROGRESS STEPS */}
      <div className="flex justify-between items-center gap-4">
        {[
          { num: 1, title: "Qual Veículo?" },
          { num: 2, title: "Quando?" },
          { num: 3, title: "Resumo Mágico" },
        ].map((s, idx) => (
          <div key={s.num} className="flex-1">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                  step >= s.num
                    ? "bg-[#820000] text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {step > s.num ? <CheckCircle className="w-5 h-5" /> : s.num}
              </div>
              <span
                className={`text-sm font-bold ${
                  step === s.num
                    ? "text-[#820000]"
                    : step > s.num
                      ? "text-gray-600"
                      : "text-gray-400"
                }`}
              >
                {s.title}
              </span>
            </div>
            {idx < 2 && (
              <div
                className={`h-1 mt-3 rounded transition-all ${
                  step > s.num ? "bg-[#820000]" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* STEP 1: VEHICLE SELECTION */}
      {step === 1 && hasAppointmentItem && (
        <Card className="p-8 border border-gray-200 rounded-2xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Selecione o seu carro
          </h2>
          <p className="text-gray-600 mb-6">
            A Lojista calculará automaticamente o tempo baseado no tamanho do
            veículo.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {vehicles.map((vehicle) => (
              <button
                key={vehicle.id}
                onClick={() => setCheckoutData({ ...checkoutData, vehicle })}
                className={`p-5 rounded-xl border-2 transition-all text-left ${
                  checkoutData.vehicle?.id === vehicle.id
                    ? "border-[#820000] bg-red-50"
                    : "border-gray-300 hover:border-[#820000] bg-white"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Car className="w-6 h-6 text-[#820000]" />
                  <h3 className="font-bold text-gray-900">{vehicle.name}</h3>
                </div>
                <p className="text-sm text-gray-600 ml-9">{vehicle.plate}</p>
              </button>
            ))}
          </div>

          <Button
            className="w-full bg-gray-200 text-gray-700 hover:bg-gray-300 font-bold py-3 rounded-lg mb-4"
            onClick={() => navigate(`/${ROLE_BASE_PATHS.client}/veiculos`)}
          >
            + Quero agendar com um Carro Novo
          </Button>

          <div className="flex gap-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() =>
                navigate(`/${ROLE_BASE_PATHS.client}/agendamento/carrinho`)
              }
            >
              Voltar
            </Button>
            <Button
              disabled={!checkoutData.vehicle}
              className="flex-1 bg-[#820000] hover:bg-[#660000] text-white font-bold disabled:opacity-50 rounded-lg"
              onClick={() => setStep(2)}
            >
              Próximo <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 2: DATE & TIME */}
      {step === 2 && hasAppointmentItem && (
        <Card className="p-8 border border-gray-200 rounded-2xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Reserve o Horário
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Data Preferencial
              </label>
              <Input
                type="date"
                value={checkoutData.date}
                min={today}
                onChange={(e) =>
                  setCheckoutData({
                    ...checkoutData,
                    date: e.target.value,
                    time: "",
                  })
                }
                className="rounded-lg"
              />  
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Horários Livres da Loja
              </label>
              <div className="flex flex-wrap gap-2">
                {availableTimes.map((time) => (
                  <button
                    key={time}
                    onClick={() => setCheckoutData({ ...checkoutData, time })}
                    className={`px-4 py-2 rounded-full font-bold transition-all ${
                      checkoutData.time === time
                        ? "bg-[#820000] text-white"
                        : "border-2 border-[#820000] text-[#820000] hover:bg-red-50"
                    }`}
                  >
                    {time}
                  </button>
                ))}

                {checkoutData.date && availableTimes.length === 0 && (
                  <p className="text-sm text-gray-500">
                    Não há horários disponíveis para esta data.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* PICKUP OPTION */}
          {canUsePickup && (
            <Card className="p-6 border-2 border-dashed border-red-200 bg-red-50 rounded-xl mb-8">
              <label className="flex items-start gap-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checkoutData.pickupRequired}
                  onChange={(e) =>
                    setCheckoutData({
                      ...checkoutData,
                      pickupRequired: e.target.checked,
                    })
                  }
                  className="w-5 h-5 mt-1 accent-[#820000]"
                />
                <div>
                  <h4 className="font-bold text-gray-900 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-[#820000]" />
                    Solicitar Coleta em Domicílio (Leva e Traz)?
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Adicional de R$ {pickupCost.toFixed(2)}
                  </p>
                </div>
              </label>
            </Card>
          )}

          <div className="flex gap-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setStep(1)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <Button
              disabled={!checkoutData.date || !checkoutData.time}
              className="flex-1 bg-[#820000] hover:bg-[#660000] text-white font-bold disabled:opacity-50 rounded-lg"
              onClick={() => {
                if (checkoutData.date < today) {
                  toast.error("Não é possível agendar para uma data passada.");
                  return;
                }

                if (checkoutData.date === today && checkoutData.time <= currentTime) {
                  toast.error("Não é possível agendar para um horário passado.");
                  return;
                }

                setStep(3);
              }}
            >
              Próximo <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 3: SUMMARY */}
      {step === 3 && (
        <Card className="p-8 border-2 border-green-400 bg-green-50 rounded-2xl">
          <div className="flex items-start gap-3 mb-8">
            <CheckCircle className="w-8 h-8 text-green-600 shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
               {hasOnlyProducts ? "Resumo da sua Compra" : "Resumo do seu Agendamento"}
              </h2>
              <p className="text-gray-600 mt-1">
                {hasOnlyProducts
                  ? "Revise os produtos antes de finalizar"
                  : "Revise todos os detalhes antes de confirmar"}
              </p>
            </div>
          </div>

          {/* SUMMARY DETAILS */}
          <Card className="p-6 bg-white border border-gray-200 mb-8 rounded-xl">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Loja de Destino
                  </p>
                  <p className="font-bold text-gray-900">{storeInfo?.name}</p>
                </div>
                {hasAppointmentItem && (
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Veículo Escalcado
                    </p>
                    <p className="font-bold text-gray-900 flex items-center gap-2">
                      <Car className="w-4 h-4" />
                      {checkoutData.vehicle?.name} (Placa:{" "}
                      {checkoutData.vehicle?.plate})
                    </p>
                  </div>
                )}
                {hasAppointmentItem && (
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Data e Horário
                  </p>
                  <p className="font-bold text-gray-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {checkoutData.date} às {checkoutData.time}
                  </p>
                </div>
                )}
                {checkoutData.pickupRequired && (
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Serviço Especial
                    </p>
                    <p className="font-bold text-gray-900 flex items-center gap-2">
                      <Truck className="w-4 h-4" />
                      Coleta em Domicílio
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h4 className="font-bold text-gray-900 mb-4">
                 {hasOnlyProducts ? "Produtos da Lojinha" : "Itens Agendados"}
                </h4>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <span className="text-gray-600">
                        {item.name} {item.quantity > 1 && `(x${item.quantity})`}
                      </span>
                      <span className="font-bold text-gray-900">
                        R$ {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* PRICING BREAKDOWN */}
          <Card className="p-6 bg-white border border-gray-200 mb-8 rounded-xl">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-bold text-gray-900">
                  R$ {total.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Taxa de Serviço (10%):</span>
                <span className="font-bold text-gray-900">
                  R$ {(total * 0.1).toFixed(2)}
                </span>
              </div>
              {checkoutData.pickupRequired && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Coleta em Domicílio:</span>
                  <span className="font-bold text-gray-900">
                    R$ {pickupCost.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-3 flex justify-between">
                <span className="font-bold text-gray-900">Total:</span>
                <span className="text-2xl font-extrabold text-[#820000]">
                  R$ {finalTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </Card>

          {/* LOYALTY */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-8 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-sm text-blue-900 font-medium">
              Você ganhará{" "}
              <strong>+{loyaltyPoints} Pontos Fidelidade</strong> nesta visita.
            </p>
          </div>

          <div className="flex gap-4">
            <Button
              variant="outline"
              className="flex-1 border-[#820000] text-[#820000] hover:bg-red-50 rounded-lg"
              onClick={() =>
                hasOnlyProducts
                  ? navigate(`/${ROLE_BASE_PATHS.client}/agendamento/carrinho`)
                  : setStep(2)
              }
            >
              {hasOnlyProducts ? "Voltar ao Carrinho" : "Ajustar Horário"}
            </Button>
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-all shadow-lg"
              onClick={async () => {
                try {
                  const serviceItem = items.find(
                    (item) => item.type === "service" || item.type === "package"
                  );
                  const isPackage = serviceItem?.type === "package";
                  
                  if (hasAppointmentItem && !checkoutData.vehicle?.id) {
                    toast.error("Selecione um veículo válido.");
                    return;
                  }
              
                  if (!storeInfo?.id) {
                    toast.error("Loja inválida.");
                    return;
                  }
              
                  if (hasAppointmentItem && !serviceItem?.id) {
                    toast.error("Serviço ou pacote inválido.");
                    return;
                  }

                  if (hasAppointmentItem) {
                    if (checkoutData.date < today) {
                      toast.error("Não é possível agendar para uma data passada.");
                      return;
                    }
                  
                  if (checkoutData.date === today && checkoutData.time <= currentTime) {
                      toast.error("Não é possível agendar para um horário passado.");
                      return;
                    }
                  }

                  if (hasOnlyProducts) {
                    await api.post("/store/product-orders", {
                      store_id: String(storeInfo.id),
                      items: items.map((item) => ({
                        product_id: item.id,
                        quantity: item.quantity,
                      })),
                      total_price: finalTotal,
                    });
                  
                    clearCart();
                  
                    toast.success("Compra realizada com sucesso!");
                  
                    navigate(`/${ROLE_BASE_PATHS.client}/agendamentos`);
                    return;
                  }
              
                  await createAppointment({
                    storeId: String(storeInfo.id),
                    vehicleId: String(checkoutData.vehicle.id),
                  
                    serviceId: isPackage ? null : String(serviceItem?.id),
                    packageId: isPackage ? String(serviceItem?.id) : null,
                  
                    scheduledAt: `${checkoutData.date}T${checkoutData.time}:00`,
                    price: finalTotal,
                    notes: checkoutData.pickupRequired
                      ? "Coleta em domicílio solicitada. Adicional de R$ 25,00."
                      : undefined,
                  } as any);
                  
                  clearCart();
                  
                  toast.success("Agendamento criado com sucesso!");
              
                  navigate(`/${ROLE_BASE_PATHS.client}/agendamentos`);
                } catch (error: any) {
                  console.error("Erro ao criar agendamento:", error);
                  console.error("Status:", error?.response?.status);
                  console.error("Resposta da API:", error?.response?.data);
                
                  toast.error(
                    error?.response?.data?.message ||
                    "Erro ao criar agendamento",
                  );
                }
              }}
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Confirmar Reserva
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
