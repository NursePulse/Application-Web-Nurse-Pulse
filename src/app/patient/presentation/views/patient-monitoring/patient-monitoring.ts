import { Component, computed, inject, OnInit, signal } from "@angular/core";
import { DatePipe } from "@angular/common";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { PatientStore } from "../../../application/patient.store";
import { PatientApiEndpoint } from "../../../infrastructure/patient-api-endpoint";
import { PatientAssembler } from "../../../infrastructure/patient-assembler";
import { Patient } from "../../../domain/model/patient.entity";
import { VitalSignStore } from "@vital-sign/application/vital-sign.store";
import { ClinicalEventStore } from "@clinical-event/application/clinical-event.store";
import { NotificationStore } from "@notification/application/notification.store";
import { SbarStore } from "@sbar/application/sbar.store";
import { AuditStore } from "@audit/application/audit.store";
import { AlertStatus } from "@notification/domain/model/alert.entity";
import { VitalSign } from "@vital-sign/domain/model/vital-sign.entity";
import { TranslatePipe } from "@ngx-translate/core";

@Component({
  selector: "app-patient-monitoring",
  standalone: true,
  imports: [TranslatePipe, DatePipe, RouterLink],
  templateUrl: "./patient-monitoring.html",
  styleUrl: "./patient-monitoring.css",
})
export class PatientMonitoringComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private patientStore = inject(PatientStore);
  private patientApi = inject(PatientApiEndpoint);

  protected vitalSignStore = inject(VitalSignStore);
  protected eventStore = inject(ClinicalEventStore);
  protected notificationStore = inject(NotificationStore);
  protected sbarStore = inject(SbarStore);
  protected auditStore = inject(AuditStore);

  patient = signal<Patient | null>(null);

  protected patientVitals = computed(() =>
    this.vitalSignStore
      .vitalSigns()
      .filter((item) => item.patientId === this.patient()?.id),
  );
  protected patientEvents = computed(() =>
    this.eventStore
      .events()
      .filter((item) => item.patientId === this.patient()?.id),
  );
  protected patientAlerts = computed(() =>
    this.notificationStore
      .alerts()
      .filter((item) => item.patientId === this.patient()?.id),
  );
  protected patientSbar = computed(() =>
    this.sbarStore
      .transfers()
      .filter((item) => item.patientId === this.patient()?.id),
  );
  protected lastVital = computed<VitalSign | undefined>(
    () => this.patientVitals()[0],
  );
  protected activeAlerts = computed(() =>
    this.patientAlerts().filter((item) => item.status !== AlertStatus.CLOSED),
  );

  ngOnInit(): void {
    this.patientStore.loadPatients();
    this.vitalSignStore.loadVitalSigns();
    this.notificationStore.loadAlerts();
    this.auditStore.loadLogs();

    const id = this.route.snapshot.paramMap.get("id");
    if (!id) return;

    const cached = this.patientStore.patients().find((p) => p.id === id);
    if (cached) {
      this.patient.set(cached);
      this.vitalSignStore.loadByPatientId(id);
      return;
    }

    this.patientApi.getById(id).subscribe((found) => {
      this.patient.set(PatientAssembler.toEntity(found));
      this.vitalSignStore.loadByPatientId(id);
    });
  }

  goBack(): void {
    this.router.navigate(["/patients"]);
  }
}
