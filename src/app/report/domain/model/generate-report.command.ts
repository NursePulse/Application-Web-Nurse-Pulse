export class GenerateReportCommand {
  constructor(
    public readonly type: string,
    public readonly title: string,
    public readonly startDate: Date,
    public readonly endDate: Date,
  ) {}
}
