import { Injectable, inject, signal } from "@angular/core";
import { catchError, forkJoin, map, of, switchMap } from "rxjs";
import { Report, ReportStatus } from "../domain/model/report.entity";
import { ReportAssembler } from "../infrastructure/report-assembler";
import { ReportResponse } from "../infrastructure/report-response";
import { AuditStore } from "@audit/application/audit.store";
import { AuditAction } from "@audit/domain/model/audit-log.entity";
import { PatientApiEndpoint } from "@patient/infrastructure/patient-api-endpoint";
import { VitalSignApiEndpoint } from "@vital-sign/infrastructure/vital-sign-api-endpoint";
import { SbarApiEndpoint } from "@sbar/infrastructure/sbar-api-endpoint";
import { NotificationApiEndpoint } from "@notification/infrastructure/notification-api-endpoint";
import { AuditApiEndpoint } from "@audit/infrastructure/audit-api-endpoint";
import { SbarTransferResponse } from "@sbar/infrastructure/sbar-transfer-response";

@Injectable({ providedIn: "root" })
export class ReportStore {
  private readonly audit = inject(AuditStore);
  private readonly patientsApi = inject(PatientApiEndpoint);
  private readonly vitalSignsApi = inject(VitalSignApiEndpoint);
  private readonly sbarApi = inject(SbarApiEndpoint);
  private readonly alertsApi = inject(NotificationApiEndpoint);
  private readonly auditApi = inject(AuditApiEndpoint);

  private readonly storageKey = "pulse-report.generated-reports";

  private readonly _reports = signal<Report[]>([]);
  readonly reports = this._reports.asReadonly();

  loadReports(): void {
    const reports = this.readStoredReports()
      .map((report) => ReportAssembler.toEntity(report))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    this._reports.set(reports);
  }

  generateReport(
    form: Pick<ReportResponse, "type" | "title" | "startDate" | "endDate">,
  ): void {
    this.patientsApi
      .getAll()
      .pipe(
        switchMap((patients) => {
          const handoverRequests = patients.map((patient) =>
            this.sbarApi
              .getByPatientId(String(patient.id))
              .pipe(catchError(() => of([] as SbarTransferResponse[]))),
          );

          const sbarTransfers$ = handoverRequests.length
            ? forkJoin(handoverRequests).pipe(map((groups) => groups.flat()))
            : of([] as SbarTransferResponse[]);

          return forkJoin({
            patients: of(patients),
            vitalSigns: this.vitalSignsApi
              .getAll()
              .pipe(catchError(() => of([]))),
            sbarTransfers: sbarTransfers$,
            alerts: this.alertsApi.getAll().pipe(catchError(() => of([]))),
            auditLogs: this.auditApi.getAll().pipe(catchError(() => of([]))),
          });
        }),
      )
      .subscribe((data) => {
        const start = new Date(form.startDate).getTime();
        const end = new Date(form.endDate).getTime();

        const inRange = (date?: string): boolean => {
          if (!date) return false;
          const value = new Date(date).getTime();
          return value >= start && value <= end;
        };

        const vitalSigns = data.vitalSigns.filter((item) =>
          inRange(item.recordedAt),
        );
        const sbarTransfers = data.sbarTransfers.filter((item) =>
          item.transferredAt ? inRange(item.transferredAt) : true,
        );
        const alerts = data.alerts.filter((item) =>
          item.triggeredAt ? inRange(item.triggeredAt) : true,
        );
        const auditLogs = data.auditLogs.filter((item) =>
          inRange(item.performedAt),
        );
        const clinicalEvents = auditLogs.filter(
          (item) => item.entityType === "CLINICAL_EVENT",
        );

        const activeAlerts = alerts.filter((item) => item.status !== "CLOSED");
        const criticalAlerts = alerts.filter(
          (item) => item.severity === "CRITICAL" && item.status !== "CLOSED",
        );

        const response: ReportResponse = {
          ...form,
          id: crypto.randomUUID(),
          generatedBy: "Equipo clínico",
          status: ReportStatus.COMPLETED,
          createdAt: new Date().toISOString(),
          summary: {
            patients: data.patients.length,
            vitalSigns: vitalSigns.length,
            clinicalEvents: clinicalEvents.length,
            sbarTransfers: sbarTransfers.length,
            activeAlerts: activeAlerts.length,
            criticalAlerts: criticalAlerts.length,
            auditLogs: auditLogs.length,
          },
          clinicalConclusion: this.buildConclusion(
            vitalSigns.length,
            sbarTransfers.length,
            activeAlerts.length,
            criticalAlerts.length,
          ),
        };

        const stored = [response, ...this.readStoredReports()];
        this.saveStoredReports(stored);

        const report = ReportAssembler.toEntity(response);
        this._reports.update((list) => [report, ...list]);

        this.audit.register(
          AuditAction.REPORT_GENERATED,
          `Generó reporte: ${report.title}`,
        );
        this.audit.register(
          AuditAction.BUSINESS_TRANSACTION_EXECUTED,
          "Transacción: consolidación de datos clínicos conectados al backend - reporte - auditoría",
        );
      });
  }

  private buildConclusion(
    vitalSigns: number,
    sbarTransfers: number,
    alerts: number,
    criticalAlerts: number,
  ): string {
    if (criticalAlerts > 0)
      return `Se detectaron ${criticalAlerts} alerta(s) crítica(s). Requiere revisión médica prioritaria.`;
    if (alerts > 0)
      return `Existen ${alerts} alerta(s) activa(s). Mantener seguimiento del turno.`;
    if (vitalSigns > 0 || sbarTransfers > 0)
      return "Periodo con actividad clínica registrada y sin alertas críticas activas.";
    return "No se encontraron movimientos clínicos relevantes en el periodo seleccionado.";
  }

  private readStoredReports(): ReportResponse[] {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) return [];

    try {
      return JSON.parse(raw) as ReportResponse[];
    } catch {
      return [];
    }
  }

  private saveStoredReports(reports: ReportResponse[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(reports));
  }
}
