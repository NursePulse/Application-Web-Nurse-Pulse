export type SbarStatus =
  | "PENDING"
  | "ACKNOWLEDGED"
  | "COMPLETED"
  | "CANCELLED"
  | string;

export class SbarTransfer {
  constructor(
    public readonly id: string,
    public readonly patientId: string,
    public readonly patientName: string,
    public readonly sourceNurseId: string,
    public readonly sourceNurseName: string,
    public readonly targetNurseId: string,
    public readonly targetNurseName: string,
    public readonly situation: string,
    public readonly background: string,
    public readonly assessment: string,
    public readonly recommendation: string,
    public readonly transferredAt: Date,
    public readonly status: SbarStatus = "PENDING",
    public readonly additionalNotes?: string | null,
  ) {}

  get statusLabel(): string {
    const labels: Record<string, string> = {
      PENDING: "Pendiente",
      ACKNOWLEDGED: "Atendido",
      COMPLETED: "Completado",
      CANCELLED: "Cancelado",
    };

    return labels[this.status] ?? this.status;
  }

  get canAcknowledge(): boolean {
    return this.status === "PENDING";
  }
}
