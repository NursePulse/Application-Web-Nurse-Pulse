import { Component, inject, OnInit, signal } from "@angular/core";
import { DatePipe } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ClinicalEventStore } from "../../../application/clinical-event.store";
import { PatientStore } from "@patient/application/patient.store";
import {
  ClinicalEventSeverity,
  ClinicalEventType,
} from "../../../domain/model/clinical-event.entity";
import { TranslatePipe, TranslateService } from "@ngx-translate/core";

@Component({
  selector: "app-clinical-event-list",
  standalone: true,
  imports: [TranslatePipe, DatePipe, FormsModule],
  templateUrl: "./clinical-event-list.html",
  styleUrl: "./clinical-event-list.css",
})
export class ClinicalEventListComponent implements OnInit {
  protected store = inject(ClinicalEventStore);
  protected patientStore = inject(PatientStore);
  private translate = inject(TranslateService);

  showForm = signal(false);
  errorMessage = signal<string | null>(null);

  eventTypes = Object.values(ClinicalEventType);
  severities = Object.values(ClinicalEventSeverity);

  form = this.emptyForm();

  ngOnInit(): void {
    this.patientStore.loadPatients();
    this.store.loadEvents();
  }

  save(): void {
    this.errorMessage.set(this.validateForm());
    if (this.errorMessage()) return;

    this.store.registerEvent({
      ...this.form,
      title: this.form.title.trim(),
      description: this.form.description.trim(),
    });

    this.form = this.emptyForm();
    this.showForm.set(false);
  }

  private emptyForm() {
    return {
      patientId: "",
      eventType: ClinicalEventType.OBSERVATION,
      severity: ClinicalEventSeverity.LOW,
      title: "",
      description: "",
    };
  }

  private validateForm(): string | null {
    if (!this.form.patientId)
      return this.translate.instant("events.validation.patientRequired");
    if (this.form.title.trim().length < 4)
      return this.translate.instant("events.validation.titleRequired");
    if (this.form.description.trim().length < 10)
      return this.translate.instant("events.validation.descriptionRequired");
    return null;
  }
}
