export class DashboardSummary {
  constructor(
    public readonly monitoredPatients: number,
    public readonly activeAlerts: number,
    public readonly criticalAlerts: number,
    public readonly moderateAlerts: number,
    public readonly clinicalEventsToday: number,
    public readonly inspectionsThisMonth: number,
    public readonly lastUpdate: Date,
  ) {}
}
