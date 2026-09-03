import { Injectable, inject, signal } from "@angular/core";
import { Patient, PatientStatusEnum } from "../domain/model/patient.entity";
import { PatientApiEndpoint } from "../infrastructure/patient-api-endpoint";
import { PatientAssembler } from "../infrastructure/patient-assembler";
import { RegisterPatientRequest } from "../infrastructure/register-patient.request";
import { AuditStore } from "@audit/application/audit.store";
import { AuditAction } from "@audit/domain/model/audit-log.entity";

@Injectable({ providedIn: "root" })
export class PatientStore {
  private readonly api = inject(PatientApiEndpoint);
  private readonly audit = inject(AuditStore);

  private _patients = signal<Patient[]>([]);
  readonly patients = this._patients.asReadonly();

  loadPatients(): void {
    this.api
      .getAll()
      .subscribe((res) =>
        this._patients.set(PatientAssembler.toEntityList(res)),
      );
  }

  createPatient(request: RegisterPatientRequest): void {
    this.api.create(request).subscribe((created) => {
      const patient = PatientAssembler.toEntity(created);
      this._patients.update((list) => [...list, patient]);
      this.audit.register(
        AuditAction.PATIENT_CREATED,
        `Registró al paciente ${patient.fullName}`,
      );
    });
  }

  updatePatient(patientId: string, request: RegisterPatientRequest): void {
    this.api.update(patientId, request).subscribe((updated) => {
      const patient = PatientAssembler.toEntity(updated);
      this._patients.update((list) =>
        list.map((p) => (p.id === patient.id ? patient : p)),
      );
    });
  }

  dischargePatient(patientId: string): void {
    const patient = this._patients().find((p) => p.id === patientId);
    if (!patient) return;

    const request: RegisterPatientRequest = {
      firstName: patient.firstName,
      lastName: patient.lastName,
      documentNumber: patient.documentNumber,
      birthDate: patient.birthDate.toISOString().slice(0, 10),
      gender: patient.gender,
      diagnosis: patient.diagnosis,
      roomNumber: patient.roomNumber,
      bedNumber: patient.bedNumber,
      attendingPhysician: patient.attendingPhysician,
      status: PatientStatusEnum.DISCHARGED,
      admissionDate: patient.admissionDate.toISOString().slice(0, 10),
    };

    this.updatePatient(patientId, request);
  }

  deletePatient(patientId: string): void {
    this.api.delete(patientId).subscribe(() => {
      this._patients.update((list) =>
        list.filter((patient) => patient.id !== patientId),
      );
    });
  }
}
