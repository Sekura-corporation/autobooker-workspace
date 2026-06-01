import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ROLE_BASE_PATHS } from "@/utils/constants";
import { useCart } from "@/context/useCart";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import {
  getStore,
  getStoreServices,
  getStoreProducts,
  getStorePackages,
  type ApiStoreRecord,
  type ApiStoreServiceRecord,
} from "@/services/stores.service";
import { useToast } from "@/hooks/useToast";
import type { LucideIcon } from "lucide-react";
import {
  Star,
  MapPin,
  Phone,
  Clock,
  ArrowLeft,
  MessageSquare,
  Droplet,
  Shield,
  Sparkles,
  ShoppingCart,
  Zap,
  CheckCircle,
} from "lucide-react";

type StoreView = {
  id: string;
  name: string;
  address: string;
  phone: string;
  openingHours: string;
  description: string;
  rating: number;
  reviews: number;
  image?: string;
};

type ServiceCardModel = {
  id: string;
  name: string;
  price: number;
  priceLabel: string;
  durationLabel: string;
  description?: string;
  icon: LucideIcon;
};

type ProductCardModel = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  icon: LucideIcon;
};

type PackageCardModel = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  sessions: number;
  validity_days: number;
  icon: LucideIcon;
};

const SERVICE_ICONS = [Droplet, Sparkles, Zap, Shield] as const;

function pickString(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}

function formatStoreAddress(s: ApiStoreRecord): string {
  const line1 = pickString(s.address);
  const city = pickString(s.city);
  const state = pickString(s.state);
  const zip = pickString(s.zipCode ?? s.zip_code);
  const parts = [line1, [city, state].filter(Boolean).join(" / "), zip].filter(
    Boolean,
  ) as string[];
  if (parts.length) return parts.join(" · ");
  return "Endereço não informado.";
}

function formatStorePhone(s: ApiStoreRecord): string {
  return pickString(s.phone) ?? "—";
}

function formatOpeningHours(s: ApiStoreRecord): string {
  return pickString(s.openingHours ?? s.opening_hours) ?? "—";
}

function mapRecordToStoreView(raw: ApiStoreRecord): StoreView {
  const id = pickString(raw.id) ?? "";
  const name = pickString(raw.name) ?? "Estética";
  return {
    id,
    name,
    address: formatStoreAddress(raw),
    phone: formatStorePhone(raw),
    openingHours: formatOpeningHours(raw),
    rating: 0,
    reviews: 0,
    image: pickString(raw.image),
    description: pickString(raw.description) ?? "Descrição não informada.",
  };
}

function durationMinutesFromApi(s: ApiStoreServiceRecord): number {
  if (typeof s.durationMinutes === "number") return s.durationMinutes;
  if (typeof s.duration_minutes === "number") return s.duration_minutes;
  if (typeof s.duration === "number") return s.duration;
  return 0;
}

function formatDurationLabel(minutes: number): string {
  if (!minutes || minutes < 1) return "Duração a consultar.";
  if (minutes < 60) return `Duração aprox. ${minutes} min.`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `Duração aprox. ${h}h.`;
  return `Duração aprox. ${h}h ${m}min.`;
}

function formatBrl(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function mapServiceToCard(
  s: ApiStoreServiceRecord,
  index: number,
): ServiceCardModel {
  const id = pickString(s.id) ?? String(index);
  const name = pickString(s.name) ?? "Serviço";
  const price = typeof s.price === "number" ? s.price : Number(s.price) || 0;
  const mins = durationMinutesFromApi(s);
  return {
    id,
    name,
    price,
    priceLabel: formatBrl(price),
    durationLabel: formatDurationLabel(mins),
    description: pickString(s.description),
    icon: SERVICE_ICONS[index % SERVICE_ICONS.length],
  };
}

export default function StoreDetail() {
  const navigate = useNavigate();
  const { storeId } = useParams<{ storeId: string }>();
  const { addItem, items } = useCart();
  const { error: toastError } = useToast();
  const [activeTab, setActiveTab] = useState<
    "services" | "packages" | "products"
  >("services");
  const [addedItems, setAddedItems] = useState<string[]>([]);
  const [store, setStore] = useState<StoreView | null>(null);
  const [services, setServices] = useState<ServiceCardModel[]>([]);
  const [products, setProducts] = useState<ProductCardModel[]>([]);
  const [packages, setPackages] = useState<PackageCardModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!storeId) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setNotFound(false);
      try {
        const [rawStore, rawServices, rawProducts, rawPackages] = await Promise.all([
          getStore(storeId),
          getStoreServices(storeId, { active: true }),
          getStoreProducts(storeId),
          getStorePackages(storeId),
        ]);

        console.log("LOJA CLIENTE:", rawStore);
        if (cancelled) return;

        const view = mapRecordToStoreView(rawStore);
        if (!view.id) {
          setNotFound(true);
          setStore(null);
          setServices([]);
          return;
        }

        setStore(view);
        const list = Array.isArray(rawServices) ? rawServices : [];
        setServices(list.map((svc, i) => mapServiceToCard(svc, i)));
        setProducts(
          rawProducts.map((product: any, index: number) => ({
            id: String(product.id),
            name: product.name,
            price: Number(product.price),
            quantity: product.quantity,
            icon: SERVICE_ICONS[index % SERVICE_ICONS.length],
          }))
        );
        const packageList = Array.isArray(rawPackages) ? rawPackages : [];
        setPackages(
          packageList.map((pkg: any, index: number) => ({
            id: String(pkg.id),
            name: pkg.name,
            description: pkg.description,
            price: Number(pkg.price),
            sessions: Number(pkg.sessions),
            validity_days: Number(pkg.validity_days),
            icon: SERVICE_ICONS[index % SERVICE_ICONS.length],
          }))
        );
      } catch {
        if (!cancelled) {
          toastError("Não foi possível carregar esta estética.");
          setNotFound(true);
          setStore(null);
          setServices([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- carregar ao mudar loja
  }, [storeId]);

  if (loading) {
    return (
      <div className="flex flex-col gap-8 w-full max-w-none">
        <Button
          variant="outline"
          className="w-max"
          onClick={() =>
            navigate(`/${ROLE_BASE_PATHS.client}/novo-agendamento`)
          }
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Empresas
        </Button>
        <p className="text-gray-600">Carregando...</p>
      </div>
    );
  }

  if (notFound || !store) {
    return (
      <div className="flex flex-col gap-8 w-full max-w-none">
        <Button
          variant="outline"
          className="w-max"
          onClick={() =>
            navigate(`/${ROLE_BASE_PATHS.client}/novo-agendamento`)
          }
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Empresas
        </Button>
        <p className="text-gray-600">Empresa não encontrada</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-none">
      {/* BACK BUTTON */}
      <Button
        variant="outline"
        className="w-max text-gray-700 hover:text-gray-900 hover:bg-gray-100 border-gray-300 rounded-lg"
        onClick={() => navigate(`/${ROLE_BASE_PATHS.client}/novo-agendamento`)}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar para Empresas
      </Button>

      {/* HERO SECTION */}
      <div className="relative h-72 rounded-2xl overflow-hidden group shadow-lg">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-linear-to-r from-gray-900/60 via-gray-900/40 to-transparent"
          style={{
            backgroundImage: store.image ? `url(${store.image})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        {/* Category Badge */}
        <div className="absolute top-6 left-6 z-10">
          <Badge className="bg-[#820000] text-white font-bold px-4 py-2 text-sm uppercase tracking-wider">
            Estética Especializada
          </Badge>
        </div>

        {/* Contact Button */}
        <div className="absolute top-6 right-6 z-10">
          <Button className="bg-[#820000] hover:bg-[#660000] text-white flex items-center gap-2 px-6 py-3 rounded-xl font-bold shadow-lg transition-all">
            <MessageSquare className="w-5 h-5" />
            <span>Falar com Atendente</span>
          </Button>
        </div>

        {/* Store Info - Bottom Left */}
        <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 via-black/40 to-transparent p-6 z-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
            {store.name}
          </h1>

          <p className="text-white/90 text-sm md:text-base max-w-2xl mb-3">
            {store.description}
          </p>
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 text-white">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              <span className="text-sm md:text-base">{store.address}</span>
            </div>
            <span className="hidden md:block text-gray-300">•</span>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="text-sm md:text-base font-bold">
                {store.rating > 0 ? store.rating.toFixed(1) : "—"}
              </span>
              <span className="text-gray-300 text-sm">
                ({store.reviews > 0 ? `${store.reviews} avaliações` : "—"})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("services")}
          className={`pb-4 px-6 font-bold text-lg whitespace-nowrap transition-all relative ${
            activeTab === "services"
              ? "text-[#820000] border-b-2 border-[#820000]"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          1. Serviços
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("packages")}
          className={`pb-4 px-6 font-bold text-lg whitespace-nowrap transition-all relative ${
            activeTab === "packages"
              ? "text-[#820000] border-b-2 border-[#820000]"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          2. Pacotes VIP
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("products")}
          className={`pb-4 px-6 font-bold text-lg whitespace-nowrap transition-all relative ${
            activeTab === "products"
              ? "text-[#820000] border-b-2 border-[#820000]"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          3. Lojinha Física
        </button>
      </div>

      {/* TAB CONTENT */}
      <div className="space-y-6">
        {/* SERVICES TAB */}
        {activeTab === "services" && (
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-6">
              Serviços Avulsos
            </h2>
            {services.length === 0 ? (
              <p className="text-gray-600 text-sm">
                Nenhum serviço ativo disponível no momento.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => {
                  const IconComponent = service.icon;
                  const cartKey = service.id;
                  return (
                    <Card
                      key={service.id}
                      className="p-6 border border-gray-200 hover:border-[#820000] hover:shadow-lg transition-all rounded-xl"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-red-50 rounded-lg">
                          <IconComponent className="w-6 h-6 text-[#820000]" />
                        </div>
                      </div>
                      <h3 className="font-bold text-gray-900 mb-2 text-lg">
                        {service.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        {service.description || service.durationLabel}
                      </p>
                      <p className="text-2xl font-extrabold text-green-600 mb-6">
                        {service.priceLabel}
                      </p>
                      <Button
                        className={`w-full font-bold rounded-lg py-2.5 transition-all shadow-md ${
                          addedItems.includes(cartKey)
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : "bg-[#820000] hover:bg-[#660000] text-white"
                        }`}
                        onClick={() => {
                          const alreadyHasAppointmentItem = items.some(
                            (item) => item.type === "service" || item.type === "package"
                          );
                        
                          if (alreadyHasAppointmentItem) {
                            alert("Você só pode agendar um serviço ou pacote por vez.");
                            return;
                          }
                        
                          addItem({
                            id: service.id,
                            storeId: store.id,
                            storeName: store.name,
                            type: "service",
                            name: service.name,
                            price: service.price,
                            quantity: 1,
                            duration: service.durationLabel,
                          });
                        
                          if (!addedItems.includes(cartKey)) {
                            setAddedItems([...addedItems, cartKey]);
                          }
                        }}
                      >
                        {addedItems.includes(cartKey) ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Adicionado
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Adicionar
                          </>
                        )}
                      </Button>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* PACKAGES TAB */}
        {activeTab === "packages" && (
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-6">
              Pacotes Mensais/VIP
            </h2>

            {packages.length === 0 ? (
              <p className="text-gray-600 text-sm">
                Nenhum pacote disponível no momento.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {packages.map((pkg) => {
                  const IconComponent = pkg.icon;
                  const packageKey = `package-${pkg.id}`;

                  return (
                    <Card
                      key={pkg.id}
                      className="p-6 border-2 border-gray-200 hover:border-[#820000] hover:shadow-lg transition-all rounded-xl"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-red-100 rounded-lg">
                          <IconComponent className="w-6 h-6 text-[#820000]" />
                        </div>

                        <Badge className="bg-[#820000] text-white font-bold text-xs px-3 py-1">
                          VIP
                        </Badge>
                      </div>

                      <h3 className="font-bold text-gray-900 mb-1 text-lg">
                        {pkg.name}
                      </h3>

                      <p className="text-sm text-gray-600 mb-3 font-medium">
                        {pkg.description || "Pacote promocional da estética"}
                      </p>

                      <div className="flex flex-col gap-1 mb-4 text-sm text-gray-600">
                        <span>
                          {pkg.sessions} {pkg.sessions === 1 ? "sessão" : "sessões"}
                        </span>

                        <span>
                          Validade: {pkg.validity_days} dias
                        </span>
                      </div>

                      <p className="text-2xl font-extrabold text-green-600 mb-6">
                        {formatBrl(pkg.price)}
                      </p>

                      <Button
                        className={`w-full font-bold rounded-lg py-2.5 transition-all shadow-md ${
                          addedItems.includes(packageKey)
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : "bg-[#820000] hover:bg-[#660000] text-white"
                        }`}
                        onClick={() => {
                          const alreadyHasAppointmentItem = items.some(
                            (item) => item.type === "service" || item.type === "package"
                          );

                          if (alreadyHasAppointmentItem) {
                            alert("Você só pode agendar um serviço ou pacote por vez.");
                            return;
                          }

                          addItem({
                            id: pkg.id,
                            storeId: store.id,
                            storeName: store.name,
                            type: "package",
                            name: pkg.name,
                            price: pkg.price,
                            quantity: 1,
                            duration: `${pkg.sessions} ${
                              pkg.sessions === 1 ? "sessão" : "sessões"
                            } · ${pkg.validity_days} dias`,
                          });

                          if (!addedItems.includes(packageKey)) {
                            setAddedItems([...addedItems, packageKey]);
                          }
                        }}
                      >
                        {addedItems.includes(packageKey) ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Adicionado
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Comprar Pacote
                          </>
                        )}
                      </Button>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

              {/* PRODUCTS TAB */}
              {activeTab === "products" && (
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-6">
              Produtos p/ Comprar no Local
            </h2>

            {products.length === 0 ? (
              <p className="text-gray-600 text-sm">
                Nenhum produto disponível no momento.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => {
                  const IconComponent = product.icon;
                  const cartKey = `product-${product.id}`;

                  return (
                    <Card
                      key={product.id}
                      className="p-6 border border-gray-200 hover:border-[#820000] hover:shadow-lg transition-all rounded-xl"
                    >
                      <div className="p-4 bg-gray-100 rounded-lg mb-4 w-fit">
                        <IconComponent className="w-8 h-8 text-gray-600" />
                      </div>

                      <h3 className="font-bold text-gray-900 mb-2 text-lg">
                        {product.name}
                      </h3>

                      <p className="text-xs text-gray-500 mb-4">
                        Disponível: {product.quantity} un.
                      </p>

                      <p className="text-2xl font-extrabold text-green-600 mb-6">
                        {formatBrl(product.price)}
                      </p>

                      <Button
                        className={`w-full font-bold rounded-lg py-2.5 transition-all ${
                          addedItems.includes(cartKey)
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                        }`}
                        onClick={() => {
                          addItem({
                            id: product.id,
                            storeId: store.id,
                            storeName: store.name,
                            type: "product",
                            name: product.name,
                            price: product.price,
                            quantity: 1,
                          });

                          if (!addedItems.includes(cartKey)) {
                            setAddedItems([...addedItems, cartKey]);
                          }
                        }}
                      >
                        {addedItems.includes(cartKey) ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Adicionado
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Adicionar
                          </>
                        )}
                      </Button>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* STORE INFO SECTION */}
      <Card className="p-8 bg-linear-to-r from-gray-50 to-white border border-gray-200 mt-8 rounded-2xl">
        <h3 className="text-xl font-bold text-gray-900 mb-8">
          Informações da Estética
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-100 rounded-lg h-fit">
              <MapPin className="w-5 h-5 text-[#820000]" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Localização
              </p>
              <p className="text-gray-900 font-semibold text-sm">
                {store.address}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-100 rounded-lg h-fit">
              <Phone className="w-5 h-5 text-[#820000]" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Telefone
              </p>
              <p className="text-gray-900 font-semibold text-sm">
                {store.phone}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-100 rounded-lg h-fit">
              <Clock className="w-5 h-5 text-[#820000]" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Horário
              </p>
              <p className="text-gray-900 font-semibold text-sm">
                {store.openingHours}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* CART ACTION SECTION */}
      {addedItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl p-4 flex justify-between items-center max-w-4xl mx-auto">
          <div>
            <p className="text-sm text-gray-600">
              {addedItems.length} item{addedItems.length > 1 ? "ns" : ""}{" "}
              adicionado{addedItems.length > 1 ? "s" : ""} ao carrinho
            </p>
          </div>
          <Button
            className="bg-[#820000] hover:bg-[#660000] text-white font-bold px-8 py-3 rounded-lg flex items-center gap-2 transition-all shadow-lg"
            onClick={() =>
              navigate(`/${ROLE_BASE_PATHS.client}/agendamento/carrinho`)
            }
          >
            <ShoppingCart className="w-5 h-5" />
            Ver Carrinho
          </Button>
        </div>
      )}
    </div>
  );
}
