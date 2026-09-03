import { Component, inject, OnInit } from "@angular/core";
import { DatePipe } from "@angular/common";
import { RouterLink } from "@angular/router";
import { PatientStore } from "@patient/application/patient.store";
import { PatientStatusEnum } from "@patient/domain/model/patient.entity";
import { NotificationStore } from "@notification/application/notification.store";
import { AuditStore } from "@audit/application/audit.store";
import {
  AlertSeverity,
  AlertStatus,
} from "@notification/domain/model/alert.entity";
import { TranslatePipe } from "@ngx-translate/core";
import { ViewModeStore } from "@shared/application/view-mode.store";
import { AuthStore } from "@iam/application/auth.store";

@Component({
  selector: "app-dashboard-view",
  standalone: true,
  imports: [TranslatePipe, DatePipe, RouterLink],
  templateUrl: "./dashboard-view.html",
  styleUrl: "./dashboard-view.css",
})
export class DashboardViewComponent implements OnInit {
  protected patientStore = inject(PatientStore);
  protected notificationStore = inject(NotificationStore);
  protected auditStore = inject(AuditStore);
  protected viewModeStore = inject(ViewModeStore);
  protected authStore = inject(AuthStore);

  ngOnInit(): void {
    this.patientStore.loadPatients();
    this.notificationStore.loadAlerts();
    if (this.authStore.hasAnyRole(["ROLE_DOCTOR", "ROLE_ADMIN"])) {
      this.auditStore.loadLogs();
    }
  }

  protected activePatientsCount(): number {
    return this.patientStore
      .patients()
      .filter((p) => p.status !== PatientStatusEnum.DISCHARGED).length;
  }

  protected activeAlertsCount(): number {
    return this.notificationStore
      .alerts()
      .filter((a) => a.status !== AlertStatus.CLOSED).length;
  }

  protected criticalPatientsCount(): number {
    return this.patientStore
      .patients()
      .filter((patient) => patient.status === PatientStatusEnum.CRITICAL)
      .length;
  }

  protected criticalAlertsCount(): number {
    return this.notificationStore
      .alerts()
      .filter(
        (a) =>
          a.severity === AlertSeverity.CRITICAL &&
          a.status !== AlertStatus.CLOSED,
      ).length;
  }

  protected moderateAlertsCount(): number {
    return this.notificationStore
      .alerts()
      .filter(
        (a) =>
          a.severity !== AlertSeverity.CRITICAL &&
          a.status !== AlertStatus.CLOSED,
      ).length;
  }

  protected auditMovementsCount(): number {
    return this.auditStore.logs().length;
  }

  protected connectedModulesCount(): number {
    if (this.viewModeStore.isAdmin()) return 8;
    if (this.viewModeStore.isDoctor()) return 5;
    return 6;
  }

  protected lastUpdate(): Date {
    return (
      this.auditStore.logs()[0]?.performedAt ??
      this.notificationStore.alerts()[0]?.triggeredAt ??
      new Date()
    );
  }

  protected latestPatients() {
    return this.patientStore.patients().slice(0, 5);
  }

  protected latestAlerts() {
    return this.notificationStore
      .alerts()
      .filter((a) => a.status !== AlertStatus.CLOSED)
      .slice(0, 5);
  }

  protected latestAudits() {
    return this.auditStore.logs().slice(0, 5);
  }

  protected patientInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }
}
