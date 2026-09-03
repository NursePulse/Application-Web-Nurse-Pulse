import {
  AlertSeverity,
  AlertStatus,
  AlertType,
} from "../domain/model/alert.entity";

export interface AlertResponse {
  id: string | number;
  patientId: string | number;
  type: AlertType | string;
  severity: AlertSeverity | string;
  description: string;
  status: AlertStatus | string;
  triggeredBy: string;
  attendedBy?: string;
  attendedAt?: string;
  closedBy?: string;
  resolutionNotes?: string;
  closedAt?: string;

  // Compatibilidad temporal con reportes antiguos del front
  triggeredAt: string;
}

export interface CreateAlertRequest {
  patientId: number;
  type: AlertType;
  severity: AlertSeverity;
  description: string;
  triggeredBy: string;
}

export interface AttendAlertRequest {
  attendedBy: string;
}

export interface CloseAlertRequest {
  closedBy: string;
  resolutionNotes: string;
}
