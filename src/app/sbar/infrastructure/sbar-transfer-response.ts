export interface SbarTransferResponse {
  id: string | number;
  patientId: string | number;
  title: string;
  description: string;
  status: "PENDING" | "ACKNOWLEDGED" | "COMPLETED" | "CANCELLED" | string;
  incomingNurseId?: string | number | null;
  additionalNotes?: string | null;
  transferredAt?: string;
}
