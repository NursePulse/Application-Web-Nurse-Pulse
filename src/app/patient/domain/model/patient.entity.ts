export enum PatientStatusEnum {
  STABLE = "STABLE",
  OBSERVATION = "OBSERVATION",
  CRITICAL = "CRITICAL",
  DISCHARGED = "DISCHARGED",
}

export class Patient {
  constructor(
    public readonly id: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly documentNumber: string,
    public readonly birthDate: Date,
    public readonly gender: string,
    public readonly diagnosis: string,
    public readonly roomNumber: string,
    public readonly bedNumber: string,
    public readonly attendingPhysician: string,
    public readonly status: PatientStatusEnum,
    public readonly admissionDate: Date,
  ) {}

  get code(): string {
    return `P${String(this.id).padStart(3, "0")}`;
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  get statusLabel(): string {
    const labels: Record<PatientStatusEnum, string> = {
      [PatientStatusEnum.STABLE]: "Estable",
      [PatientStatusEnum.OBSERVATION]: "En observación",
      [PatientStatusEnum.CRITICAL]: "Crítico",
      [PatientStatusEnum.DISCHARGED]: "Alta",
    };

    return labels[this.status] ?? this.status;
  }

  get age(): number {
    const today = new Date();
    let age = today.getFullYear() - this.birthDate.getFullYear();
    const m = today.getMonth() - this.birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < this.birthDate.getDate())) age--;

    return age;
  }

  get requiresMonitoring(): boolean {
    return (
      this.status !== PatientStatusEnum.STABLE &&
      this.status !== PatientStatusEnum.DISCHARGED
    );
  }
}
