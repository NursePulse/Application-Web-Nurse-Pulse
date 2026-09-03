export interface RegisterSbarRequest {
  patientId: number;
  title: string;
  description: string;
}

export interface AcknowledgeSbarRequest {
  incomingNurseId: number;
  additionalNotes?: string;
}
