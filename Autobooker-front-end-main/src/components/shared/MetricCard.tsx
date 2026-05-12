import type { ElementType } from "react";
import Card from "../ui/Card";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: ElementType;
  iconColorClass?: string;
}

export default function MetricCard({
  title,
  value,
  icon: Icon,
  iconColorClass = "bg-zinc-100 text-zinc-600",
}: MetricCardProps) {
  return (
    <Card className="flex items-center gap-6 p-6!">
      <div
        className={`w-14 h-14 rounded-lg flex items-center justify-center ${iconColorClass}`}
      >
        <Icon size={26} />
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.15em] mb-1">
          {title}
        </span>
        <p className="text-2xl font-black text-[#050505]">{value}</p>
      </div>
    </Card>
  );
}
