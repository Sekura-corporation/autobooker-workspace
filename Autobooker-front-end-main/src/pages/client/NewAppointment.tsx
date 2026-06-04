import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROLE_BASE_PATHS } from "@/utils/constants";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import {
  listStores,
  getStoreServices,
  type ApiStoreRecord,
} from "@/services/stores.service";
import { useToast } from "@/hooks/useToast";
import {
  Star,
  MapPin,
  ChevronRight,
  Search,
  Briefcase,
  AlertCircle,
} from "lucide-react";

type MarketplaceStoreRow = {
  id: string;
  name: string;
  address: string;
  distance: string;
  rating: number;
  reviews: number;
  services: string[];
  image?: string;
};

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

function mapApiStoreToRow(
  raw: ApiStoreRecord,
  serviceNames: string[],
): MarketplaceStoreRow {
  const id = pickString(raw.id) ?? "";
  const name = pickString(raw.name) ?? "Sem nome";
  return {
    id,
    name,
    address: formatStoreAddress(raw),
    distance: "—",
    rating: 0,
    reviews: 0,
    services: serviceNames.length ? serviceNames : ["Ver serviços na loja"],
    image: pickString(raw.logo_url) ?? pickString(raw.image),
  };
}

export default function ClientNewAppointment() {
  const navigate = useNavigate();
  const { error: toastError } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"distance" | "rating">("distance");
  const [stores, setStores] = useState<MarketplaceStoreRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const list = await listStores({ status: "active", limit: 50 });
        if (cancelled) return;

        const base = Array.isArray(list) ? list : [];
        const settled = await Promise.allSettled(
          base.map((st) => {
            const sid = pickString(st.id);
            if (!sid) return Promise.resolve([]);
            return getStoreServices(sid, { active: true });
          }),
        );

        const rows: MarketplaceStoreRow[] = base.map((st, i) => {
          const svcResult = settled[i];
          let names: string[] = [];
          if (svcResult.status === "fulfilled") {
            const arr = Array.isArray(svcResult.value) ? svcResult.value : [];
            names = arr
              .map((x) => pickString(x.name))
              .filter((n): n is string => Boolean(n));
          }
          return mapApiStoreToRow(st, names);
        });

        setStores(rows.filter((r) => r.id));
      } catch {
        if (!cancelled) {
          toastError("Não foi possível carregar as estéticas.");
          setStores([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredStores = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    let next = stores;

    if (term) {
      next = stores.filter(
        (store) =>
          store.name.toLowerCase().includes(term) ||
          store.address.toLowerCase().includes(term) ||
          store.services.some((s) => s.toLowerCase().includes(term)),
      );
    }

    const copy = [...next];
    if (sortBy === "rating") {
      copy.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    } else {
      copy.sort((a, b) => b.id.localeCompare(a.id, undefined, { numeric: true }));
    }
    return copy;
  }, [stores, searchTerm, sortBy]);

  return (
    <div className="flex flex-col gap-8 w-full max-w-none">
      {/* ──────────────────────────────────────── */}
      {/* HEADER */}
      {/* ──────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
          Encontre a Estética Ideal
        </h1>
        <p className="text-gray-500 text-base md:text-lg font-medium">
          Consulte preços, distância e serviços avaliados
        </p>
      </div>

      {/* ──────────────────────────────────────── */}
      {/* SEARCH & FILTERS */}
      {/* ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar por bairro ou nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 py-3 rounded-xl border-gray-200 focus:ring-[#820000] focus:border-[#820000]"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as "distance" | "rating")}
          className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#820000] focus:border-transparent bg-white text-gray-900 font-medium shadow-sm"
        >
          <option value="distance">Mais recentes</option>
          <option value="rating">Nome (A–Z)</option>
        </select>
      </div>

      {/* ──────────────────────────────────────── */}
      {/* STORES GRID */}
      {/* ──────────────────────────────────────── */}
      {loading ? (
        <Card className="p-12 text-center border-dashed border-2 border-gray-200">
          <p className="text-gray-600 font-medium">Carregando estéticas...</p>
        </Card>
      ) : filteredStores.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-2 border-gray-200">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 font-medium text-lg">
            Nenhuma empresa encontrada
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Tente buscar com outros termos ou filtros
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStores.map((store) => (
            <Card
              key={store.id}
              className="p-0 overflow-hidden border border-gray-100 hover:border-red-100 hover:shadow-xl transition-all cursor-pointer group rounded-2xl"
            >
              {/* Image Container */}
              <div className="relative h-48 bg-linear-to-br from-gray-50 to-gray-100 overflow-hidden group-hover:from-red-50 group-hover:to-red-100 transition-colors">
                {store.image ? (
                  <img
                    src={store.image}
                    alt={store.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Briefcase className="w-16 h-16 text-gray-300" />
                  </div>
                )}

                {/* Rating Badge - Positioned Absolute */}
                <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-2 shadow-lg flex items-center gap-1.5 border border-gray-100">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold text-gray-900 text-sm">
                    {store.rating > 0 ? store.rating.toFixed(1) : "—"}
                  </span>
                  <span className="text-gray-500 text-xs">
                    ({store.reviews > 0 ? store.reviews : "—"})
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 space-y-4">
                {/* Name & Distance Row */}
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-[#820000] transition-colors">
                    {store.name}
                  </h3>
                  <p className="text-gray-500 text-sm font-medium flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                    {store.distance}
                  </p>
                </div>

                {/* Address */}
                <p className="text-sm text-gray-600 line-clamp-2">
                  {store.address}
                </p>

                {/* Services Badges */}
                <div className="flex flex-wrap gap-2">
                  {store.services.slice(0, 2).map((service, idx) => (
                    <Badge
                      key={`${store.id}-svc-${idx}`}
                      className="bg-red-50 text-[#820000] border-red-100 text-xs font-semibold px-3 py-1 rounded-lg"
                    >
                      {service}
                    </Badge>
                  ))}
                  {store.services.length > 2 && (
                    <Badge className="bg-gray-50 text-gray-600 border-gray-100 text-xs font-semibold px-3 py-1 rounded-lg">
                      +{store.services.length - 2}
                    </Badge>
                  )}
                </div>

                {/* Button */}
                <Button
                  className="w-full bg-[#820000] hover:bg-[#660000] text-white font-bold py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all mt-2"
                  onClick={() => {
                    navigate(`/${ROLE_BASE_PATHS.client}/estética/${store.id}`);
                  }}
                >
                  Agendar Serviço <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* NO MODAL NEEDED - Navigation handles it */}
    </div>
  );
}
