export class RecordVitalSignCommand {
  constructor(
    public readonly patientId: string,
    public readonly heartRate: number,
    public readonly respiratoryRate: number,
    public readonly systolic: number,
    public readonly diastolic: number,
    public readonly oxygenSaturation: number,
    public readonly temperature: number,
    public readonly notes: string,
  ) {}
}
