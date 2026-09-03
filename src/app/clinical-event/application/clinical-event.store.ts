import { Injectable, inject, signal } from "@angular/core";
import {
  ClinicalEvent,
  ClinicalEventSeverity,
} from "../domain/model/clinical-event.entity";
import { ClinicalEventApiEndpoint } from "../infrastructure/clinical-event-api-endpoint";
import { ClinicalEventAssembler } from "../infrastructure/clinical-event-assembler";
import { PatientStore } from "@patient/application/patient.store";
import { AuditStore } from "@audit/application/audit.store";
import { AuditAction } from "@audit/domain/model/audit-log.entity";
import { NotificationStore } from "@notification/application/notification.store";
import { AlertSeverity } from "@notification/domain/model/alert.entity";

@Injectable({ providedIn: "root" })
export class ClinicalEventStore {
  private readonly api = inject(ClinicalEventApiEndpoint);
  private readonly patients = inject(PatientStore);
  private readonly audit = inject(AuditStore);
  private readonly notifications = inject(NotificationStore);

  private readonly _events = signal<ClinicalEvent[]>([]);
  readonly events = this._events.asReadonly();
  readonly errorKey = signal<string | null>(null);

  loadEvents(): void {
    this.errorKey.set(null);
    this.api.getAll().subscribe({
      next: (responses) => {
        const events = responses
          .map((response) =>
            ClinicalEventAssembler.toEntity(
              response,
              this.patientNameOf(String(response.patientId)),
            ),
          )
          .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());

        this._events.set(events);
      },
      error: () => this.errorKey.set("events.errors.load"),
    });
  }

  registerEvent(form: {
    patientId: string;
    eventType: string;
    severity: string;
    title: string;
    description: string;
  }): void {
    this.errorKey.set(null);
    this.api.register(ClinicalEventAssembler.toRequest(form)).subscribe({
      next: (created) => {
        const event = ClinicalEventAssembler.toEntity(
          created,
          this.patientNameOf(String(created.patientId)),
        );
        this._events.update((list) => [event, ...list]);

        this.audit.register(
          AuditAction.BUSINESS_TRANSACTION_EXECUTED,
          `Transacción: evento clínico - alerta si aplica - auditoría para ${event.patientName}`,
        );

        this.createAlertWhenNeeded(event);
      },
      error: () => this.errorKey.set("events.errors.save"),
    });
  }

  private patientNameOf(patientId: string): string {
    return (
      this.patients.patients().find((patient) => patient.id === patientId)
        ?.fullName ?? `Paciente #${patientId}`
    );
  }

  private createAlertWhenNeeded(event: ClinicalEvent): void {
    if (
      event.severity !== ClinicalEventSeverity.HIGH &&
      event.severity !== ClinicalEventSeverity.CRITICAL
    )
      return;

    this.notifications.createClinicalAlert({
      patientId: event.patientId,
      patientName: event.patientName,
      title:
        event.severity === ClinicalEventSeverity.CRITICAL
          ? "Evento clínico crítico"
          : "Evento clínico de alto riesgo",
      message: `${event.eventType}: ${event.title}. ${event.description}`,
      severity:
        event.severity === ClinicalEventSeverity.CRITICAL
          ? AlertSeverity.CRITICAL
          : AlertSeverity.HIGH,
      sourceType: "CLINICAL_EVENT",
      sourceId: event.id,
    });
  }
}
