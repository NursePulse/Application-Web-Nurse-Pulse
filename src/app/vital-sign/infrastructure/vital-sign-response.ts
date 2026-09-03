import { RiskLevel } from "../domain/model/vital-sign.entity";

export interface VitalSignResponse {
  id: string | number;
  patientId: string | number;
  nurseId: string | number;
  heartRate: number;
  respiratoryRate: number;
  systolic: number;
  diastolic: number;
  oxygenSaturation: number;
  temperature: number;
  riskLevel: RiskLevel | string;
  recordedAt: string;
}
