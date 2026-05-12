import * as React from "react";
import { motion } from "motion/react";
import type { Variants } from "motion/react";
import { Check } from "lucide-react";
import logoSvg from "@/assets/logo-autobooker.svg";
interface AuthLayoutProps {
  children: React.ReactNode;
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 90, damping: 18 },
  },
};

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="lp-theme">
      <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-[#050505]">
        {/* Background elements consistent with landing */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="lp-bg-orb lp-bg-orb-red top-[-10%] left-[-5%] h-[40%] w-[40%]" />
          <div className="lp-bg-orb lp-bg-orb-dark bottom-[-10%] right-[-5%] h-[60%] w-[60%]" />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-30 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle at 70% 50%, rgba(220, 38, 38, 0.3) 0%, transparent 60%)`,
            }}
          />
        </div>

        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="animate"
          className="relative z-10 w-full max-w-125 bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/50 rounded-lg p-8 md:p-12 shadow-2xl overflow-y-auto max-h-[90vh] scrollbar-hide lp-panel"
        >
          <div className="flex flex-col items-center mb-8">
            <img
              src={logoSvg}
              alt="AutoBooker"
              className="h-8 w-auto brightness-0 invert animate-pulse motion-safe:animate-none"
            />
          </div>

          {children}
        </motion.div>
      </div>
    </div>
  );
}

interface InputProps extends React.ComponentPropsWithoutRef<"input"> {
  label: string;
  placeholder?: string;
  type?: string;
  error?: string;
  helper?: string;
}

export function Input({ label, error, helper, ...props }: InputProps) {
  return (
    <div className="w-full mb-5">
      <label className="block text-zinc-400 text-xs mb-2 ml-1 font-medium">
        {label}
      </label>
      <input
        {...props}
        className={`w-full bg-zinc-100 dark:bg-white text-zinc-900 rounded-lg px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-red-600/50 transition-all placeholder:text-zinc-400 text-sm ${error ? "ring-2 ring-red-500/40 focus:ring-red-600" : ""}`}
      />
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
      {helper && !error && (
        <p className="mt-2 text-xs text-zinc-400">{helper}</p>
      )}
    </div>
  );
}

interface SuccessViewProps {
  title: string;
  description: string;
  onAction: () => void;
  actionLabel?: string;
}

export function SuccessView({
  title,
  description,
  onAction,
  actionLabel = "Fazer Login",
}: SuccessViewProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-16 h-16 bg-green-500/20 rounded-lg flex items-center justify-center mb-6">
        <Check className="text-green-500" size={32} />
      </div>
      <h2 className="text-2xl font-bold mb-3 text-white">{title}</h2>
      <p className="text-zinc-400 text-sm mb-8 leading-relaxed max-w-70">
        {description}
      </p>
      <button
        onClick={onAction}
        className="w-full py-4 bg-red-800 hover:bg-red-700 text-white rounded-lg font-semibold transition-all shadow-lg shadow-red-900/20"
      >
        {actionLabel}
      </button>
    </div>
  );
}
