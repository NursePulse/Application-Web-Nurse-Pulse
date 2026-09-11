export interface RegisterSbarRequest {
  patientId: number;
  title: string;
  situation: string;
  background: string;
  assessment: string;
  recommendation: string;
  targetNurseId?: number;
}

export interface AcknowledgeSbarRequest {
  additionalNotes?: string;
}
