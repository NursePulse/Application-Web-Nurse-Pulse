export enum ClinicalEventType {
  MEDICATION = "Medicación administrada",
  PROCEDURE = "Procedimiento realizado",
  CONDITION_CHANGE = "Cambio de condición",
  COMPLICATION = "Complicación",
  EMERGENCY = "Emergencia",
  OBSERVATION = "Observación",
}

export enum ClinicalEventSeverity {
  LOW = "Bajo",
  MODERATE = "Moderado",
  HIGH = "Alto",
  CRITICAL = "Crítico",
}

export class ClinicalEvent {
  constructor(
    public readonly id: string,
    public readonly patientId: string,
    public readonly patientName: string,
    public readonly nurseId: string,
    public readonly nurseName: string,
    public readonly eventType: ClinicalEventType,
    public readonly severity: ClinicalEventSeverity,
    public readonly title: string,
    public readonly description: string,
    public readonly occurredAt: Date,
  ) {}

  get isCritical(): boolean {
    return this.severity === ClinicalEventSeverity.CRITICAL;
  }
}
