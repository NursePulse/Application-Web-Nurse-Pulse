import { Component, inject, OnInit, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { PatientStore } from "../../../application/patient.store";
import { Router } from "@angular/router";
import { TranslatePipe } from "@ngx-translate/core";
import {
  Patient,
  PatientStatusEnum,
} from "../../../domain/model/patient.entity";

@Component({
  selector: "app-patient-list",
  standalone: true,
  imports: [TranslatePipe, FormsModule],
  templateUrl: "./patient-list.html",
  styleUrl: "./patient-list.css",
})
export class PatientListComponent implements OnInit {
  protected store = inject(PatientStore);
  private router = inject(Router);

  activeMenu = signal<string | null>(null);
  showForm = signal(false);
  editingPatientId = signal<string | null>(null);
  query = signal("");
  errorMessage = signal<string | null>(null);

  form = this.emptyForm();

  ngOnInit(): void {
    this.store.loadPatients();
  }

  private emptyForm() {
    return {
      firstName: "",
      lastName: "",
      documentNumber: "",
      birthDate: "1980-01-01",
      gender: "Male",
      diagnosis: "",
      roomNumber: "",
      bedNumber: "",
      attendingPhysician: "",
      status: PatientStatusEnum.OBSERVATION,
      admissionDate: new Date().toISOString().slice(0, 10),
    };
  }

  private fillForm(patient: Patient): void {
    this.form = {
      firstName: patient.firstName,
      lastName: patient.lastName,
      documentNumber: patient.documentNumber,
      birthDate: patient.birthDate.toISOString().slice(0, 10),
      gender: patient.gender,
      diagnosis: patient.diagnosis,
      roomNumber: patient.roomNumber,
      bedNumber: patient.bedNumber,
      attendingPhysician: patient.attendingPhysician,
      status: patient.status,
      admissionDate: patient.admissionDate.toISOString().slice(0, 10),
    };
  }

  filteredPatients() {
    const value = this.query().trim().toLowerCase();
    if (!value) return this.store.patients();

    return this.store
      .patients()
      .filter((patient) =>
        `${patient.code} ${patient.fullName} ${patient.documentNumber} ${patient.roomNumber} ${patient.bedNumber} ${patient.statusLabel} ${patient.diagnosis}`
          .toLowerCase()
          .includes(value),
      );
  }

  openCreateForm(): void {
    this.errorMessage.set(null);
    this.editingPatientId.set(null);
    this.form = this.emptyForm();
    this.showForm.set(true);
  }

  cancelForm(): void {
    this.errorMessage.set(null);
    this.editingPatientId.set(null);
    this.form = this.emptyForm();
    this.showForm.set(false);
  }

  toggleMenu(patientId: string): void {
    this.activeMenu.update((v) => (v === patientId ? null : patientId));
  }

  closeMenu(): void {
    this.activeMenu.set(null);
  }

  goToMonitoring(patientId: string): void {
    this.closeMenu();
    this.router.navigate(["/patients", patientId, "monitoring"]);
  }

  editPatient(patientId: string): void {
    const patient = this.store.patients().find((p) => p.id === patientId);
    if (!patient) return;

    this.closeMenu();
    this.errorMessage.set(null);
    this.editingPatientId.set(patientId);
    this.fillForm(patient);
    this.showForm.set(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  dischargePatient(patientId: string): void {
    this.closeMenu();

    const confirmed = confirm(
      "¿Seguro que deseas dar de alta a este paciente?",
    );
    if (!confirmed) return;

    this.store.dischargePatient(patientId);
  }

  deletePatient(patientId: string): void {
    this.closeMenu();

    const confirmed = confirm("¿Seguro que deseas eliminar este paciente?");
    if (!confirmed) return;

    this.store.deletePatient(patientId);
  }

  savePatient(): void {
    this.errorMessage.set(null);

    const editingId = this.editingPatientId();

    const documentExists = this.store
      .patients()
      .some(
        (p) =>
          p.documentNumber === this.form.documentNumber.trim() &&
          p.id !== editingId,
      );

    if (documentExists) {
      this.errorMessage.set("Ya existe un paciente con ese documento.");
      return;
    }

    if (
      !this.form.firstName.trim() ||
      !this.form.lastName.trim() ||
      !this.form.documentNumber.trim() ||
      !this.form.roomNumber.trim() ||
      !this.form.bedNumber.trim() ||
      !this.form.diagnosis.trim() ||
      !this.form.attendingPhysician.trim()
    ) {
      this.errorMessage.set(
        "Completa nombres, apellidos, documento, diagnóstico, habitación, cama y médico.",
      );
      return;
    }

    const request = {
      firstName: this.form.firstName.trim(),
      lastName: this.form.lastName.trim(),
      documentNumber: this.form.documentNumber.trim(),
      birthDate: this.form.birthDate,
      gender: this.form.gender,
      diagnosis: this.form.diagnosis.trim(),
      roomNumber: this.form.roomNumber.trim(),
      bedNumber: this.form.bedNumber.trim(),
      attendingPhysician: this.form.attendingPhysician.trim(),
      status: this.form.status,
      admissionDate: this.form.admissionDate,
    };

    if (editingId) {
      this.store.updatePatient(editingId, request);
    } else {
      this.store.createPatient(request);
    }

    this.cancelForm();
  }
}
