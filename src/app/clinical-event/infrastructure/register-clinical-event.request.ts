export interface RegisterClinicalEventRequest {
  patientId: number;
  eventType: string;
  severity: string;
  title: string;
  description: string;
}
