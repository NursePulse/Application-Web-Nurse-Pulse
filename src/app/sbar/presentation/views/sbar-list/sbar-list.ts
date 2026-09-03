import { Component, inject, OnInit, signal } from "@angular/core";
import { DatePipe } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { SbarStore } from "../../../application/sbar.store";
import { PatientStore } from "@patient/application/patient.store";
import { TranslatePipe, TranslateService } from "@ngx-translate/core";

@Component({
  selector: "app-sbar-list",
  standalone: true,
  imports: [TranslatePipe, DatePipe, FormsModule],
  templateUrl: "./sbar-list.html",
  styleUrl: "./sbar-list.css",
})
export class SbarListComponent implements OnInit {
  protected store = inject(SbarStore);
  protected patientStore = inject(PatientStore);
  private translate = inject(TranslateService);

  showForm = signal(false);
  errorMessage = signal<string | null>(null);

  form = this.emptyForm();

  ngOnInit(): void {
    this.patientStore.loadPatients();
    this.store.loadTransfers();
  }

  openForm(): void {
    this.errorMessage.set(null);
    this.form = this.emptyForm();
    this.showForm.set(true);
  }

  cancelForm(): void {
    this.errorMessage.set(null);
    this.showForm.set(false);
  }

  save(): void {
    this.errorMessage.set(this.validateForm());
    if (this.errorMessage()) return;

    this.store.registerTransfer({
      ...this.form,
      situation: this.form.situation.trim(),
      background: this.form.background.trim(),
      assessment: this.form.assessment.trim(),
      recommendation: this.form.recommendation.trim(),
    });

    this.cancelForm();
  }

  acknowledge(id: string, incomingNurseId: string): void {
    this.store.acknowledgeTransfer(id, incomingNurseId);
  }

  private emptyForm() {
    return {
      patientId: "",
      targetNurseId: "2",
      situation: "",
      background: "",
      assessment: "",
      recommendation: "",
    };
  }

  private validateForm(): string | null {
    if (!this.form.patientId)
      return this.translate.instant("sbar.validation.patientRequired");
    if (this.form.situation.trim().length < 8)
      return this.translate.instant("sbar.validation.situation");
    if (this.form.background.trim().length < 8)
      return this.translate.instant("sbar.validation.background");
    if (this.form.assessment.trim().length < 8)
      return this.translate.instant("sbar.validation.assessment");
    if (this.form.recommendation.trim().length < 8)
      return this.translate.instant("sbar.validation.recommendation");
    return null;
  }
}
