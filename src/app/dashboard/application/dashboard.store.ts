import { Injectable, signal } from "@angular/core";
import { DashboardSummary } from "../domain/model/dashboard-summary.entity";

@Injectable({ providedIn: "root" })
export class DashboardStore {
  private _summary = signal<DashboardSummary>(
    new DashboardSummary(0, 0, 0, 0, 0, 0, new Date()),
  );
  readonly summary = this._summary.asReadonly();

  loadSummary(summary: DashboardSummary): void {
    this._summary.set(summary);
  }
}
