import { useEffect, useState } from "react";
import api from "@/services/api";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/shared/PageHeader";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function StoreReports() {
  const [month, setMonth] = useState(() => {
    return new Date().toISOString().slice(0, 7);
  });
  const [report, setReport] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadReports() {
    try {
      setLoading(true);

      const { data } = await api.get("/store/reports", {
        params: { month },
      });

      setReport(data.data);
    } catch (error) {
      console.error("Erro ao carregar relatórios:", error);
      alert("Erro ao carregar relatórios.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, [month]);

  function formatCurrency(value: number) {
    return Number(value || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  if (loading) {
    return <p>Carregando relatórios...</p>;
  }

  function handleExportPdf() {
    window.print();
  }

  return (
    <div className="w-full flex flex-col gap-8 pb-10">
      <PageHeader
        title="Relatórios de Faturamento"
        subtitle="Acompanhe o desempenho da sua estética"
      >
        <input
          type="month"
          value={month}
          onChange={(event) => setMonth(event.target.value)}
          className="border border-zinc-300 rounded-md px-4 py-2 text-sm text-zinc-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#820000]/20 focus:border-[#820000] w-full sm:w-auto"
        />
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="flex flex-col items-center justify-center py-10 shadow-sm border-zinc-100">
          <span className="text-sm text-zinc-400 font-medium mb-3">
            Faturamento total
          </span>
          <span className="text-4xl font-black text-[#2e8b57] mb-5 tracking-tight">
            {formatCurrency(report?.totalRevenue)}
          </span>
          <span className="text-xs font-bold text-[#2e8b57] bg-green-100 border border-[#2e8b57]/30 rounded-full px-4 py-1.5 uppercase tracking-wide">
            Mês selecionado
          </span>
        </Card>

        <Card className="flex flex-col items-center justify-center py-10 shadow-sm border-zinc-100">
          <span className="text-sm text-zinc-400 font-medium mb-3">
            Serviços Realizados
          </span>
          <span className="text-5xl font-black text-[#5e0000] mb-5 tracking-tight">
            {report?.completedServices ?? 0}
          </span>
          <span className="text-xs font-bold text-orange-600 bg-orange-50 border border-orange-300 rounded-full px-4 py-1.5 uppercase tracking-wide">
            Ticket médio de {formatCurrency(report?.averageTicket)}
          </span>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 md:p-8 shadow-sm border-zinc-100">
          <h2 className="text-xl font-bold text-zinc-900 mb-6">
            Evolução Diária
          </h2>

          <div className="w-full h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={report?.dailyRevenue || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e4e4e7"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#71717a", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#71717a", fontSize: 12 }}
                  tickFormatter={(value) => `R$${value}`}
                />
                <Tooltip
                  cursor={{ fill: "#f4f4f5" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  formatter={(value: number) => [
                    formatCurrency(value),
                    "Faturamento",
                  ]}
                />
                <Bar dataKey="total" fill="#820000" radius={[4, 4, 0, 0]} maxBarSize={80}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 md:p-8 shadow-sm border-zinc-100 flex flex-col">
          <h2 className="text-xl font-bold text-zinc-900 mb-8">
            Serviços mais Realizados
          </h2>

          <div className="flex-1 space-y-5">
            {(report?.topServices || []).length === 0 && (
              <p className="text-sm text-zinc-500">
                Nenhum serviço concluído neste mês.
              </p>
            )}

            {(report?.topServices || []).map((service: any) => (
              <div
                key={service.name}
                className="flex justify-between border-b border-zinc-200 pb-3"
              >
                <span className="text-sm font-bold text-zinc-500">
                  {service.name}
                </span>
                <span className="text-sm font-black text-zinc-900">
                  {service.total} un.
                </span>
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            onClick={handleExportPdf}
            className="w-full mt-10 !border-[#820000] !text-[#820000] hover:bg-[#820000]/10 font-bold text-base py-3.5 !rounded-md"
          >
            Exportar Relatórios em PDF
          </Button>
        </Card>
      </div>
    </div>
  );
}