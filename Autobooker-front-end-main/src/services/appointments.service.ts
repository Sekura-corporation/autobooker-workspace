import api from "./api";
import { tenantHeaders, type ServiceRecord } from "./serviceUtils";

export interface AppointmentsQuery {
  tenantId?: string;
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface AppointmentPayload extends ServiceRecord {
  customerId: string;
  vehicleId?: string;
  serviceId?: string;
  scheduledAt: string;
}

export async function listAppointments(params: AppointmentsQuery = {}) {
  const { tenantId, ...query } = params;
  const { data } = await api.get<ServiceRecord[]>("/appointments", {
    params: query,
    headers: tenantHeaders(tenantId),
  });
  return data;
}

export async function getAppointment(appointmentId: string, tenantId?: string) {
  const { data } = await api.get<ServiceRecord>(
    `/appointments/${appointmentId}`,
    {
      headers: tenantHeaders(tenantId),
    },
  );
  return data;
}

export async function createAppointment(
  payload: AppointmentPayload,
  tenantId?: string,
) {
  const { data } = await api.post<ServiceRecord>("/appointments", payload, {
    headers: tenantHeaders(tenantId),
  });
  return data;
}

export async function updateAppointment(
  appointmentId: string,
  payload: Partial<AppointmentPayload>,
  tenantId?: string,
) {
  const { data } = await api.put<ServiceRecord>(
    `/appointments/${appointmentId}`,
    payload,
    {
      headers: tenantHeaders(tenantId),
    },
  );
  return data;
}

export async function updateAppointmentStatus(
  appointmentId: string,
  status: string,
  tenantId?: string,
) {
  return updateAppointment(appointmentId, { status }, tenantId);
}

export async function rescheduleAppointment(
  appointmentId: string,
  scheduledAt: string,
  tenantId?: string,
) {
  return updateAppointment(appointmentId, { scheduledAt }, tenantId);
}

export async function assignQueuePosition(
  appointmentId: string,
  queuePosition: number,
  tenantId?: string,
) {
  return updateAppointment(appointmentId, { queuePosition }, tenantId);
}

export async function estimateAppointmentTime(
  appointmentId: string,
  estimatedMinutes: number,
  tenantId?: string,
) {
  return updateAppointment(appointmentId, { estimatedMinutes }, tenantId);
}

export async function requestPickup(appointmentId: string, tenantId?: string) {
  const { data } = await api.post<ServiceRecord>(
    `/appointments/${appointmentId}/pickup/request`,
    {},
    { headers: tenantHeaders(tenantId) },
  );
  return data;
}

export async function confirmPickup(appointmentId: string, tenantId?: string) {
  const { data } = await api.post<ServiceRecord>(
    `/appointments/${appointmentId}/pickup/confirm`,
    {},
    { headers: tenantHeaders(tenantId) },
  );
  return data;
}

export async function completeAppointment(
  appointmentId: string,
  tenantId?: string,
) {
  return updateAppointmentStatus(appointmentId, "completed", tenantId);
}

const appointmentsService = {
  listAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  updateAppointmentStatus,
  rescheduleAppointment,
  assignQueuePosition,
  estimateAppointmentTime,
  requestPickup,
  confirmPickup,
  completeAppointment,
};

export default appointmentsService; // Appointments service
