import api from "@/services/api";

export async function listProductOrders() {
  const { data } = await api.get("/product-orders");

  return data.data || [];
}