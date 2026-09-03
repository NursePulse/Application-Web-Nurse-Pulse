export class RegisterSbarCommand {
  constructor(
    public readonly patientId: string,
    public readonly targetNurseId: string,
    public readonly situation: string,
    public readonly background: string,
    public readonly assessment: string,
    public readonly recommendation: string,
  ) {}
}
