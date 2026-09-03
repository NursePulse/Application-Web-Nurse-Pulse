export enum AlertSeverity {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",

  // Compatibilidad con pantallas antiguas del front
  MODERATE = "MEDIUM",
}

export enum AlertStatus {
  OPEN = "OPEN",
  ATTENDED = "ATTENDED",
  CLOSED = "CLOSED",

  // Compatibilidad con nombres antiguos del front
  ACTIVE = "OPEN",
  ACKNOWLEDGED = "ATTENDED",
  RESOLVED = "CLOSED",
}

export enum AlertType {
  CARDIAC = "CARDIAC",
  RESPIRATORY = "RESPIRATORY",
  NEUROLOGICAL = "NEUROLOGICAL",
  FALL = "FALL",
  MEDICATION = "MEDICATION",
  OTHER = "OTHER",
}

export class Alert {
  constructor(
    public readonly id: string,
    public readonly patientId: string,
    public readonly patientName: string,
    public readonly type: AlertType,
    public readonly severity: AlertSeverity,
    public readonly description: string,
    public readonly status: AlertStatus,
    public readonly triggeredBy: string,
    public readonly triggeredAt: Date,
    public readonly attendedBy?: string,
    public readonly attendedAt?: Date,
    public readonly closedBy?: string,
    public readonly resolutionNotes?: string,
    public readonly closedAt?: Date,
  ) {}

  get title(): string {
    const labels: Record<string, string> = {
      CARDIAC: "Alerta cardiaca",
      RESPIRATORY: "Alerta respiratoria",
      NEUROLOGICAL: "Alerta neurológica",
      FALL: "Riesgo de caída",
      MEDICATION: "Alerta de medicación",
      OTHER: "Alerta clínica",
    };

    return labels[this.type] ?? "Alerta clínica";
  }

  get message(): string {
    return this.description;
  }

  get severityLabel(): string {
    const labels: Record<string, string> = {
      LOW: "Baja",
      MEDIUM: "Moderada",
      HIGH: "Alta",
      CRITICAL: "Crítica",
    };

    return labels[this.severity] ?? this.severity;
  }

  get statusLabel(): string {
    const labels: Record<string, string> = {
      OPEN: "Activa",
      ATTENDED: "Atendida",
      CLOSED: "Cerrada",
    };

    return labels[this.status] ?? this.status;
  }

  get isCritical(): boolean {
    return this.severity === AlertSeverity.CRITICAL;
  }

  get isActive(): boolean {
    return this.status !== AlertStatus.CLOSED;
  }
}
