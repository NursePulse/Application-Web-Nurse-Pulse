export interface SbarTransferResponse {
  id: string | number;
  patientId: string | number;
  title: string;
  description: string;
  situation?: string;
  background?: string;
  assessment?: string;
  recommendation?: string;
  registeredBy?: string | null;
  targetNurseId?: string | number | null;
  status: "PENDING" | "ACKNOWLEDGED" | "COMPLETED" | "CANCELLED" | string;
  incomingNurseId?: string | number | null;
  additionalNotes?: string | null;
  createdAt?: string;
  transferredAt?: string;
}
