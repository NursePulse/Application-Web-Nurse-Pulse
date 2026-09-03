export enum RiskLevel {
  UNASSESSED = "UNASSESSED",
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export class VitalSign {
  constructor(
    public readonly id: string,
    public readonly patientId: string,
    public readonly patientName: string,
    public readonly nurseId: string,
    public readonly heartRate: number,
    public readonly respiratoryRate: number,
    public readonly systolic: number,
    public readonly diastolic: number,
    public readonly oxygenSaturation: number,
    public readonly temperature: number,
    public readonly riskLevel: RiskLevel,
    public readonly recordedAt: Date,
  ) {}

  get bloodPressureFormatted(): string {
    return `TA ${this.systolic}/${this.diastolic}`;
  }

  get heartRateFormatted(): string {
    return `FC ${this.heartRate}`;
  }

  get respiratoryRateFormatted(): string {
    return `FR ${this.respiratoryRate}`;
  }

  get riskLabel(): string {
    const labels: Record<string, string> = {
      UNASSESSED: "Sin evaluar",
      LOW: "Bajo",
      MEDIUM: "Medio",
      HIGH: "Alto",
      CRITICAL: "Crítico",
    };

    return labels[this.riskLevel] ?? this.riskLevel;
  }

  get isCritical(): boolean {
    return this.riskLevel === RiskLevel.CRITICAL;
  }

  get isHighRisk(): boolean {
    return (
      this.riskLevel === RiskLevel.CRITICAL || this.riskLevel === RiskLevel.HIGH
    );
  }
}
