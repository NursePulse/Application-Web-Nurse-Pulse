export class RegisterPatientCommand {
  constructor(
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly documentNumber: string,
    public readonly dateOfBirth: Date,
    public readonly gender: string,
    public readonly phone: string,
    public readonly email: string,
    public readonly roomNumber: string,
  ) {}
}
