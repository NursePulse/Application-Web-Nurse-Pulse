export enum ReportType {
  VITAL_SIGNS = "Signos vitales",
  PATIENTS = "Pacientes",
  CLINICAL_EVENTS = "Eventos clínicos",
  SBAR = "Traspasos SBAR",
  ALERTS = "Alertas",
  AUDIT = "Auditoría",
  GENERAL = "General",
}

export enum ReportStatus {
  PENDING = "Pendiente",
  GENERATING = "Generando",
  COMPLETED = "Completado",
  FAILED = "Fallido",
}

export interface ReportSummary {
  patients: number;
  vitalSigns: number;
  clinicalEvents: number;
  sbarTransfers: number;
  activeAlerts: number;
  criticalAlerts: number;
  auditLogs: number;
}

export class Report {
  constructor(
    public readonly id: string,
    public readonly type: ReportType,
    public readonly title: string,
    public readonly generatedBy: string,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly status: ReportStatus,
    public readonly createdAt: Date,
    public readonly summary?: ReportSummary,
    public readonly clinicalConclusion?: string,
  ) {}
}
