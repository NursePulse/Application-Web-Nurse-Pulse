export class RegisterClinicalEventCommand {
  constructor(
    public readonly patientId: string,
    public readonly eventType: string,
    public readonly severity: string,
    public readonly title: string,
    public readonly description: string,
  ) {}
}
