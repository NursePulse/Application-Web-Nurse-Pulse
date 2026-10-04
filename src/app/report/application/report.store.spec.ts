import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { AuditStore } from "@audit/application/audit.store";
import { AuditApiEndpoint } from "@audit/infrastructure/audit-api-endpoint";
import { NotificationApiEndpoint } from "@notification/infrastructure/notification-api-endpoint";
import { PatientApiEndpoint } from "@patient/infrastructure/patient-api-endpoint";
import { SbarApiEndpoint } from "@sbar/infrastructure/sbar-api-endpoint";
import { VitalSignApiEndpoint } from "@vital-sign/infrastructure/vital-sign-api-endpoint";
import { ReportType } from "../domain/model/report.entity";
import { ReportStore } from "./report.store";

/** US-34: a report consolidates patients, vital signs and alerts of the selected period. */
describe("ReportStore", () => {
  const form = {
    type: ReportType.GENERAL,
    title: "Turno noche",
    startDate: "2026-01-01T00:00:00.000Z",
    endDate: "2026-01-31T23:59:59.000Z",
  };
  let audit: { register: ReturnType<typeof vi.fn> };
  let alerts: Record<string, string>[];

  function setup() {
    audit = { register: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        ReportStore,
        { provide: AuditStore, useValue: audit },
        {
          provide: PatientApiEndpoint,
          useValue: { getAll: () => of([{ id: 1 }, { id: 2 }]) },
        },
        {
          provide: VitalSignApiEndpoint,
          useValue: {
            getAll: () =>
              of([
                { recordedAt: "2026-01-10T10:00:00Z" },
                { recordedAt: "2026-01-20T10:00:00Z" },
                { recordedAt: "2025-12-01T10:00:00Z" },
              ]),
          },
        },
        {
          provide: SbarApiEndpoint,
          useValue: {
            getByPatientId: () =>
              of([{ transferredAt: "2026-01-12T10:00:00Z" }]),
          },
        },
        {
          provide: NotificationApiEndpoint,
          useValue: { getAll: () => of(alerts) },
        },
        { provide: AuditApiEndpoint, useValue: { getAll: () => of([]) } },
      ],
    });
    return TestBed.inject(ReportStore);
  }

  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
    alerts = [];
  });

  it("counts only the records inside the period", () => {
    const store = setup();

    store.generateReport(form);

    const summary = store.reports()[0].summary!;
    expect(summary.patients).toBe(2);
    expect(summary.vitalSigns).toBe(2);
    expect(summary.sbarTransfers).toBe(2);
    expect(store.generating()).toBe(false);
  });

  it("flags critical alerts in the conclusion and ignores closed ones", () => {
    alerts = [
      {
        severity: "CRITICAL",
        status: "OPEN",
        triggeredAt: "2026-01-10T10:00:00Z",
      },
      {
        severity: "CRITICAL",
        status: "CLOSED",
        triggeredAt: "2026-01-11T10:00:00Z",
      },
      { severity: "HIGH", status: "OPEN", triggeredAt: "2026-01-12T10:00:00Z" },
    ];
    const store = setup();

    store.generateReport(form);

    const report = store.reports()[0];
    expect(report.summary!.activeAlerts).toBe(2);
    expect(report.summary!.criticalAlerts).toBe(1);
    expect(report.clinicalConclusion).toContain("1 alerta(s) crítica(s)");
  });

  it("saves the report in the browser, audits it and restores it on load", () => {
    const store = setup();

    store.generateReport(form);

    expect(audit.register).toHaveBeenCalledTimes(2);
    expect(
      JSON.parse(localStorage.getItem("nurse-pulse.generated-reports")!),
    ).toHaveLength(1);

    TestBed.resetTestingModule();
    const reloaded = setup();
    reloaded.loadReports();
    expect(reloaded.reports()).toHaveLength(1);
    expect(reloaded.reports()[0].title).toBe("Turno noche");
  });

  it("recovers from corrupted stored data", () => {
    localStorage.setItem("nurse-pulse.generated-reports", "{not json");
    const store = setup();

    store.loadReports();

    expect(store.reports()).toEqual([]);
  });
});
