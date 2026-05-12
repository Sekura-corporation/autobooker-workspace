import { motion } from "motion/react";
import type { Variants } from "motion/react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Building2, User } from "lucide-react";
import logoSvg from "@/assets/logo-autobooker.svg";
import backgroundImage from "@/assets/images/auth-bg.png";

const pageVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.08,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 90, damping: 18 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 28, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 80, damping: 16 },
  },
};

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="lp-theme">
      <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-red-600/30 overflow-x-hidden relative">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="lp-bg-orb lp-bg-orb-red -top-24 -left-20 h-80 w-80" />
          <div className="lp-bg-orb lp-bg-orb-dark top-1/3 -right-32 h-112 w-md" />
          <img
            src={backgroundImage}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover object-center opacity-90"
          />
          <div className="absolute inset-0 bg-black/65" />
        </div>

        <motion.div
          className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 lp-panel"
          variants={pageVariants}
          initial="hidden"
          animate="show"
        >
          <motion.nav
            className="flex items-center justify-between py-8"
            variants={itemVariants}
          >
            <button
              type="button"
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate("/")}
            >
              <img
                src={logoSvg}
                alt="AutoBooker"
                className="h-5 w-auto brightness-0 invert transition-transform duration-300 hover:scale-[1.03]"
              />
            </button>

            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/login")}
                className="px-6 py-2 text-sm font-semibold border border-red-900/30 hover:bg-red-950/20 transition-all duration-300 rounded-lg bg-black/40 backdrop-blur-sm hover:-translate-y-0.5"
              >
                Entrar
              </button>
              <button
                onClick={() => navigate("/cadastro")}
                className="px-6 py-2 text-sm font-semibold bg-zinc-800/80 hover:bg-zinc-700 transition-all duration-300 rounded-lg backdrop-blur-sm shadow-lg shadow-white/5 hover:-translate-y-0.5"
              >
                Cadastrar-se
              </button>
            </div>
          </motion.nav>

          <main className="flex flex-col items-center text-center mt-20 lg:mt-32 pb-24">
            <motion.h1
              variants={itemVariants}
              className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]"
            >
              Sua{" "}
              <span className="text-red-600 italic">estética automotiva</span>{" "}
              <br />
              na palma da mão
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="mt-8 text-lg md:text-xl max-w-2xl text-zinc-300 font-light leading-relaxed"
            >
              A plataforma completa para quem ama cuidar do carro e a melhor
              ferramenta de gestão para estéticas automotivas.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="grid md:grid-cols-2 gap-8 mt-16 lg:mt-24 w-full max-w-4xl"
            >
              <motion.div
                variants={cardVariants}
                whileHover={{ y: -8, scale: 1.015 }}
                whileTap={{ scale: 0.99 }}
                className="group p-8 rounded-[40px] bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-md flex flex-col items-center text-center hover:border-red-900/30 transition-all shadow-2xl"
              >
                <div className="w-14 h-14 rounded-2xl bg-zinc-800 mb-6 flex items-center justify-center group-hover:bg-red-600/20 transition-all duration-300 group-hover:scale-110">
                  <User className="text-zinc-400 group-hover:text-red-500" />
                </div>
                <h3 className="text-2xl font-bold mb-4 tracking-tight">
                  Para Clientes
                </h3>
                <p className="text-zinc-400 leading-relaxed font-light mb-8">
                  Agende lavagens, polimentos e manutenções nas melhores
                  estéticas próximas a você. Acumule pontos e ganhe descontos
                  exclusivos.
                </p>
                <button
                  onClick={() => navigate("/login")}
                  className="mt-auto w-full py-4 bg-red-800 hover:bg-red-700 transition-all duration-300 rounded-2xl font-semibold flex items-center justify-center gap-2 group shadow-xl shadow-red-900/20 hover:-translate-y-0.5"
                >
                  Quero agendar meu carro
                  <ChevronRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform duration-300"
                  />
                </button>
              </motion.div>

              <motion.div
                variants={cardVariants}
                whileHover={{ y: -8, scale: 1.015 }}
                whileTap={{ scale: 0.99 }}
                className="group p-8 rounded-[40px] bg-white text-zinc-900 flex flex-col items-center text-center transition-all shadow-2xl"
              >
                <div className="w-14 h-14 rounded-2xl bg-zinc-100 mb-6 flex items-center justify-center group-hover:bg-red-100 transition-all duration-300 group-hover:scale-110">
                  <Building2 className="text-zinc-600 group-hover:text-red-600" />
                </div>
                <h3 className="text-2xl font-bold mb-4 tracking-tight text-zinc-900">
                  Para Estéticas
                </h3>
                <p className="text-zinc-600 leading-relaxed font-light mb-8">
                  Gerencie sua agenda, tenha controle total de estoque, cadastre
                  seus serviços, analise relatórios e fidelize mais clientes na
                  sua loja.
                </p>
                <button
                  onClick={() => navigate("/login")}
                  className="mt-auto w-full py-4 bg-zinc-900 text-white hover:bg-black transition-all duration-300 rounded-2xl font-semibold flex items-center justify-center gap-2 group shadow-xl shadow-black/10 hover:-translate-y-0.5"
                >
                  Quero gerenciar meu negócio
                  <ChevronRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform duration-300"
                  />
                </button>
              </motion.div>
            </motion.div>
          </main>

          <motion.footer
            variants={itemVariants}
            className="py-12 border-t border-zinc-900/50 flex flex-col md:flex-row justify-between items-center gap-4 text-zinc-400 text-sm"
          >
            <p>© 2026 AutoBooker. Todos os direitos reservados.</p>
            <div className="flex gap-8">
              <a href="#" className="hover:text-red-500 transition-colors">
                Termos
              </a>
              <a href="#" className="hover:text-red-500 transition-colors">
                Privacidade
              </a>
              <a href="#" className="hover:text-red-500 transition-colors">
                Suporte
              </a>
            </div>
          </motion.footer>
        </motion.div>
      </div>
    </div>
  );
}
