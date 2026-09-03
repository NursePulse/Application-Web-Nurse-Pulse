export interface RecordVitalSignRequest {
  patientId: number;
  nurseId: number;
  heartRate: number;
  respiratoryRate: number;
  systolicPressure: number;
  diastolicPressure: number;
  oxygenSaturation: number;
  temperature: number;
  recordedAt?: string;
}
