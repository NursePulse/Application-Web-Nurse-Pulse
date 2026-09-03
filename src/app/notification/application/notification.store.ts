import { HttpErrorResponse } from "@angular/common/http";
import { Injectable, inject, signal } from "@angular/core";
import { finalize } from "rxjs";
import {
  Alert,
  AlertSeverity,
  AlertStatus,
  AlertType,
} from "../domain/model/alert.entity";
import { NotificationApiEndpoint } from "../infrastructure/notification-api-endpoint";
import { AlertAssembler } from "../infrastructure/alert-assembler";
import { AuditStore } from "@audit/application/audit.store";
import { AuditAction } from "@audit/domain/model/audit-log.entity";
import { PatientStore } from "@patient/application/patient.store";
import { AuthStore } from "@iam/application/auth.store";
import { UserRole } from "@iam/domain/model/user.entity";

const DEFAULT_ACTOR = "Equipo clínico";
const ALERT_CLOSING_ROLES: UserRole[] = ["ROLE_DOCTOR", "ROLE_ADMIN"];

interface ClinicalAlertPayload {
  patientId: string;
  patientName?: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  sourceType?: string;
  sourceId?: string;
}

interface ManualAlertPayload {
  patientId: string;
  type: AlertType;
  severity: AlertSeverity;
  description: string;
}

@Injectable({ providedIn: "root" })
export class NotificationStore {
  private readonly api = inject(NotificationApiEndpoint);
  private readonly audit = inject(AuditStore);
  private readonly patientStore = inject(PatientStore);
  private readonly authStore = inject(AuthStore);

  private _alerts = signal<Alert[]>([]);
  readonly alerts = this._alerts.asReadonly();
  private readonly _pendingAlertIds = signal<ReadonlySet<string>>(new Set());
  private readonly _actionErrorKey = signal<string | null>(null);
  readonly actionErrorKey = this._actionErrorKey.asReadonly();

  loadAlerts(): void {
    this.api.getAll().subscribe((res) => {
      const alerts = AlertAssembler.toEntityList(res, (id) =>
        this.resolvePatientName(id),
      ).sort((a, b) => b.triggeredAt.getTime() - a.triggeredAt.getTime());

      this._alerts.set(alerts);
    });
  }

  createManualAlert(request: ManualAlertPayload): void {
    const payload = {
      patientId: Number(request.patientId),
      type: request.type,
      severity: this.resolveSeverity(request.severity),
      description: request.description,
      triggeredBy: DEFAULT_ACTOR,
    };

    this.api.create(payload).subscribe((created) => {
      const alert = AlertAssembler.toEntity(
        created,
        this.resolvePatientName(String(created.patientId)),
      );
      this._alerts.update((list) => [alert, ...list]);
      this.audit.register(
        AuditAction.ALERT_CREATED,
        `Creó alerta para ${alert.patientName}: ${alert.title}`,
      );
    });
  }

  createClinicalAlert(request: ClinicalAlertPayload): void {
    const payload = {
      patientId: Number(request.patientId),
      type: this.resolveAlertType(request.sourceType),
      severity: this.resolveSeverity(request.severity),
      description: `${request.title}: ${request.message}`,
      triggeredBy: DEFAULT_ACTOR,
    };

    this.api.create(payload).subscribe((created) => {
      const alert = AlertAssembler.toEntity(
        created,
        request.patientName ??
          this.resolvePatientName(String(created.patientId)),
      );
      this._alerts.update((list) => [alert, ...list]);
      this.audit.register(
        AuditAction.ALERT_CREATED,
        `Alerta generada para ${alert.patientName}: ${alert.title}`,
      );
    });
  }

  acknowledge(alertId: string): void {
    if (!this.beginAction(alertId)) return;

    this.api
      .acknowledge(alertId, this.currentActor())
      .pipe(finalize(() => this.endAction(alertId)))
      .subscribe({
        next: (updated) => {
          const alert = AlertAssembler.toEntity(
            updated,
            this.resolvePatientName(String(updated.patientId)),
          );
          this._alerts.update((list) =>
            list.map((a) => (a.id === alert.id ? alert : a)),
          );
          this.audit.register(
            AuditAction.ALERT_ACKNOWLEDGED,
            `Atendió alerta de ${alert.patientName}: ${alert.title}`,
          );
        },
        error: (error: unknown) => this.handleActionError(error),
      });
  }

  resolve(alertId: string): void {
    if (!this.authStore.hasAnyRole(ALERT_CLOSING_ROLES)) {
      this._actionErrorKey.set("alerts.closeForbidden");
      return;
    }

    if (!this.beginAction(alertId)) return;

    this.api
      .resolve(alertId, this.currentActor())
      .pipe(finalize(() => this.endAction(alertId)))
      .subscribe({
        next: (updated) => {
          const alert = AlertAssembler.toEntity(
            updated,
            this.resolvePatientName(String(updated.patientId)),
          );
          this._alerts.update((list) =>
            list.map((a) => (a.id === alert.id ? alert : a)),
          );
          this.audit.register(
            AuditAction.ALERT_RESOLVED,
            `Cerró alerta de ${alert.patientName}: ${alert.title}`,
          );
        },
        error: (error: unknown) => this.handleActionError(error),
      });
  }

  isActionPending(alertId: string): boolean {
    return this._pendingAlertIds().has(alertId);
  }

  clearActionError(): void {
    this._actionErrorKey.set(null);
  }

  filterBy(status: "Todas" | "Críticas" | "Moderadas"): Alert[] {
    const alerts = this._alerts().filter(
      (a) => a.status !== AlertStatus.CLOSED,
    );

    if (status === "Críticas") {
      return alerts.filter((a) => a.severity === AlertSeverity.CRITICAL);
    }

    if (status === "Moderadas") {
      return alerts.filter((a) => a.severity !== AlertSeverity.CRITICAL);
    }

    return alerts;
  }

  private resolvePatientName(patientId: string): string {
    return (
      this.patientStore.patients().find((patient) => patient.id === patientId)
        ?.fullName ?? `Paciente #${patientId}`
    );
  }

  private resolveAlertType(sourceType?: string): AlertType {
    if (sourceType === "VITAL_SIGN") return AlertType.RESPIRATORY;
    if (sourceType === "CLINICAL_EVENT") return AlertType.OTHER;
    return AlertType.OTHER;
  }

  private resolveSeverity(severity: AlertSeverity): AlertSeverity {
    if (severity === AlertSeverity.CRITICAL) return AlertSeverity.CRITICAL;
    if (severity === AlertSeverity.HIGH) return AlertSeverity.HIGH;
    if (severity === AlertSeverity.LOW) return AlertSeverity.LOW;
    return AlertSeverity.MEDIUM;
  }

  private currentActor(): string {
    return this.authStore.user()?.username ?? DEFAULT_ACTOR;
  }

  private beginAction(alertId: string): boolean {
    if (this.isActionPending(alertId)) return false;

    this._actionErrorKey.set(null);
    this._pendingAlertIds.update((current) => {
      const next = new Set(current);
      next.add(alertId);
      return next;
    });
    return true;
  }

  private endAction(alertId: string): void {
    this._pendingAlertIds.update((current) => {
      const next = new Set(current);
      next.delete(alertId);
      return next;
    });
  }

  private handleActionError(error: unknown): void {
    const key =
      error instanceof HttpErrorResponse && error.status === 403
        ? "alerts.actionForbidden"
        : "alerts.actionFailed";
    this._actionErrorKey.set(key);
  }
}
