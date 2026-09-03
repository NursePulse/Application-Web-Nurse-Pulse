import { Component, computed, inject, OnInit, signal } from "@angular/core";
import { DatePipe } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { NotificationStore } from "../../../application/notification.store";
import { PatientStore } from "@patient/application/patient.store";
import {
  AlertSeverity,
  AlertStatus,
  AlertType,
} from "../../../domain/model/alert.entity";
import { TranslatePipe, TranslateService } from "@ngx-translate/core";
import { AuthStore } from "@iam/application/auth.store";

@Component({
  selector: "app-alert-list",
  standalone: true,
  imports: [TranslatePipe, DatePipe, FormsModule],
  templateUrl: "./alert-list.html",
  styleUrl: "./alert-list.css",
})
export class AlertListComponent implements OnInit {
  protected store = inject(NotificationStore);
  protected patientStore = inject(PatientStore);
  protected authStore = inject(AuthStore);
  private translate = inject(TranslateService);

  protected readonly AlertStatus = AlertStatus;
  protected readonly AlertSeverity = AlertSeverity;
  protected readonly AlertType = AlertType;
  protected readonly canCloseAlerts = computed(() =>
    this.authStore.hasAnyRole(["ROLE_DOCTOR", "ROLE_ADMIN"]),
  );

  selectedFilter = signal<"Todas" | "Críticas" | "Moderadas">("Todas");
  showForm = signal(false);
  errorMessage = signal<string | null>(null);

  form = {
    patientId: "",
    type: AlertType.CARDIAC,
    severity: AlertSeverity.CRITICAL,
    description: "",
  };

  ngOnInit(): void {
    this.store.clearActionError();
    this.patientStore.loadPatients();
    this.store.loadAlerts();
  }

  openCreateForm(): void {
    this.errorMessage.set(null);
    this.form = {
      patientId: "",
      type: AlertType.CARDIAC,
      severity: AlertSeverity.CRITICAL,
      description: "",
    };
    this.showForm.set(true);
  }

  cancelForm(): void {
    this.errorMessage.set(null);
    this.showForm.set(false);
  }

  saveAlert(): void {
    this.errorMessage.set(null);

    if (!this.form.patientId) {
      this.errorMessage.set(this.translate.instant("alerts.patientRequired"));
      return;
    }

    if (!this.form.description.trim()) {
      this.errorMessage.set(
        this.translate.instant("alerts.descriptionRequired"),
      );
      return;
    }

    this.store.createManualAlert({
      patientId: this.form.patientId,
      type: this.form.type,
      severity: this.form.severity,
      description: this.form.description.trim(),
    });

    this.cancelForm();
  }

  acknowledge(id: string): void {
    if (this.store.isActionPending(id)) return;
    this.store.acknowledge(id);
  }

  resolve(id: string): void {
    if (!this.canCloseAlerts() || this.store.isActionPending(id)) return;
    this.store.resolve(id);
  }

  activeCount(): number {
    return this.store.alerts().filter((a) => a.status !== AlertStatus.CLOSED)
      .length;
  }
}
