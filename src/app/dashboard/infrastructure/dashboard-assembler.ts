import { DashboardSummary } from "../domain/model/dashboard-summary.entity";
import { DashboardResponse } from "./dashboard-response";

export class DashboardAssembler {
  static toEntity(r: DashboardResponse): DashboardSummary {
    return new DashboardSummary(
      r.monitoredPatients,
      r.activeAlerts,
      r.criticalAlerts,
      r.moderateAlerts,
      r.clinicalEventsToday,
      r.inspectionsThisMonth,
      new Date(r.lastUpdate),
    );
  }
}
