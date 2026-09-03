import { Component, inject, OnInit, signal } from "@angular/core";
import { DatePipe } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { VitalSignStore } from "../../../application/vital-sign.store";
import { PatientStore } from "@patient/application/patient.store";
import { TranslatePipe, TranslateService } from "@ngx-translate/core";

@Component({
  selector: "app-vital-sign-list",
  standalone: true,
  imports: [TranslatePipe, DatePipe, FormsModule],
  templateUrl: "./vital-sign-list.html",
  styleUrl: "./vital-sign-list.css",
})
export class VitalSignListComponent implements OnInit {
  protected store = inject(VitalSignStore);
  protected patientStore = inject(PatientStore);
  private translate = inject(TranslateService);

  showForm = signal(false);
  errorMessage = signal<string | null>(null);

  form = this.emptyForm();

  ngOnInit(): void {
    this.patientStore.loadPatients();
    this.store.loadVitalSigns();
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

    this.store.recordVitalSign(this.form);
    this.cancelForm();
  }

  private emptyForm() {
    return {
      patientId: "",
      heartRate: 78,
      respiratoryRate: 18,
      systolic: 120,
      diastolic: 80,
      oxygenSaturation: 98,
      temperature: 36.5,
    };
  }

  private validateForm(): string | null {
    if (!this.form.patientId)
      return this.translate.instant("vitals.validation.patientRequired");
    if (this.form.heartRate < 20 || this.form.heartRate > 250)
      return this.translate.instant("vitals.validation.heartRate");
    if (this.form.respiratoryRate < 5 || this.form.respiratoryRate > 80)
      return this.translate.instant("vitals.validation.respiratoryRate");
    if (this.form.systolic < 50 || this.form.systolic > 260)
      return this.translate.instant("vitals.validation.systolic");
    if (this.form.diastolic < 30 || this.form.diastolic > 180)
      return this.translate.instant("vitals.validation.diastolic");
    if (this.form.systolic <= this.form.diastolic)
      return this.translate.instant("vitals.validation.bloodPressure");
    if (this.form.oxygenSaturation < 0 || this.form.oxygenSaturation > 100)
      return this.translate.instant("vitals.validation.oxygen");
    if (this.form.temperature < 30 || this.form.temperature > 45)
      return this.translate.instant("vitals.validation.temperature");
    return null;
  }
}
