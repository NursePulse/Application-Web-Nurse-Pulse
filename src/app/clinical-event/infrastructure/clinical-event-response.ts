export interface ClinicalEventResponse {
  id: number | string;
  patientId: number | string;
  eventType: string;
  severity: string;
  title: string;
  description: string;
  registeredBy: string;
  occurredAt: string;
}
