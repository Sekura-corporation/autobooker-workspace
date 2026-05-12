import api from "./api";

export async function listStoreAppointments(params?: {
  date?: string;
  status?: string;
}) {
  const { data } = await api.get("/store/appointments", {
    params,
  });

  return data;
}

export async function updateStoreAppointmentStatus(
  appointmentId: string | number,
  status: string,
) {
  const { data } = await api.patch(
    `/store/appointments/${appointmentId}/status`,
    { status },
  );

  return data;
}

export async function getStoreAppointment(
    appointmentId: string | number,
  ) {
    const { data } = await api.get(
      `/store/appointments/${appointmentId}`,
    );
  
    return data;
  }