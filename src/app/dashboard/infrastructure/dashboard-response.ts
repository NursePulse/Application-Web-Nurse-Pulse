export interface DashboardResponse {
  monitoredPatients: number;
  activeAlerts: number;
  criticalAlerts: number;
  moderateAlerts: number;
  clinicalEventsToday: number;
  inspectionsThisMonth: number;
  lastUpdate: string;
}
