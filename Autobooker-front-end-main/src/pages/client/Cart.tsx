import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/useCart";
import { ROLE_BASE_PATHS } from "@/utils/constants";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { ArrowLeft, Trash2, Plus, Minus, ShoppingCart } from "lucide-react";

export default function Cart() {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCart();

  if (items.length === 0) {
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

        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="p-6 bg-gray-100 rounded-2xl">
            <ShoppingCart className="w-16 h-16 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Seu carrinho está vazio
          </h2>
          <p className="text-gray-600">
            Adicione serviços, pacotes ou produtos para continuar
          </p>
          <Button
            className="bg-[#820000] hover:bg-[#660000] text-white font-bold px-6 py-3 rounded-lg mt-4"
            onClick={() =>
              navigate(`/${ROLE_BASE_PATHS.client}/novo-agendamento`)
            }
          >
            Descobrir Serviços
          </Button>
        </div>
      </div>
    );
  }

  const total = getTotal();

  return (
    <div className="flex flex-col gap-8 w-full max-w-none">
      {/* HEADER */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
            Seu Carrinho
          </h1>
          <p className="text-gray-600 mt-2 font-medium">
            {items.length} item{items.length !== 1 ? "s" : ""} selecionado
            {items.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          variant="outline"
          className="w-max"
          onClick={() =>
            navigate(`/${ROLE_BASE_PATHS.client}/novo-agendamento`)
          }
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ITEMS LIST */}
        <div className="lg:col-span-2 space-y-4">
          {/* ITEMS */}
          <div className="space-y-3">
            {items.map((item) => (
              <Card
                key={item.id}
                className="p-6 border border-gray-200 hover:border-[#820000] transition-all rounded-xl"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-bold text-gray-900">{item.name}</h4>
                      <Badge className="bg-gray-100 text-gray-700 text-xs px-2 py-1">
                        {item.type === "service"
                          ? "Serviço"
                          : item.type === "package"
                            ? "Pacote"
                            : "Produto"}
                      </Badge>
                    </div>
                    {item.duration && (
                      <p className="text-sm text-gray-600">{item.duration}</p>
                    )}
                    {item.type === "product" && (
                      <p className="text-sm text-gray-500">
                        Estoque disponível: {item.stock ?? 0} un.
                      </p>
                    )}
                    <p className="text-lg font-bold text-green-600 mt-2">
                      R$ {item.price.toFixed(2)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {item.type === "product" && (
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="p-2 hover:bg-gray-100"
                        >
                          <Minus className="w-4 h-4 text-gray-600" />
                        </button>
                        <span className="px-4 font-bold text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          disabled={item.type === "product" && item.quantity >= (item.stock ?? 0)}
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="p-2 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Plus className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    )}

                    {item.type === "product" && item.quantity >= (item.stock ?? 0) && (
                      <p className="text-xs text-red-600 font-medium">
                        Limite do estoque atingido.
                      </p>
                    )}

                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* SUMMARY SIDEBAR */}
        <div>
          <Card className="p-6 border-2 border-gray-200 sticky top-6 rounded-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Resumo</h3>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-bold text-gray-900">
                  R$ {total.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Taxa de serviço:</span>
                <span className="font-bold text-gray-900">
                  R$ {(total * 0.1).toFixed(2)}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-4 flex justify-between">
                <span className="font-bold text-gray-900">Total:</span>
                <span className="text-2xl font-extrabold text-[#820000]">
                  R$ {(total * 1.1).toFixed(2)}
                </span>
              </div>
            </div>

            <Button
              className="w-full bg-[#820000] hover:bg-[#660000] text-white font-bold py-3 rounded-lg mb-3 transition-all shadow-md"
              onClick={() =>
                navigate(`/${ROLE_BASE_PATHS.client}/agendamento/checkout`)
              }
            >
              Proceder para Checkout
            </Button>

            <Button
              variant="outline"
              className="w-full text-gray-600 border-gray-300 hover:bg-gray-50 rounded-lg"
              onClick={() =>
                navigate(`/${ROLE_BASE_PATHS.client}/novo-agendamento`)
              }
            >
              Continuar Comprando
            </Button>

            <button
              onClick={clearCart}
              className="w-full mt-4 text-sm text-gray-500 hover:text-red-600 font-medium transition-colors"
            >
              Limpar Carrinho
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
}
