import { PatientStatusEnum } from "../domain/model/patient.entity";

export interface PatientResponse {
  id: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  documentNumber: string;
  birthDate: string;
  gender: string;
  diagnosis: string;
  roomNumber: string;
  bedNumber: string;
  attendingPhysician: string;
  status: PatientStatusEnum;
  admissionDate: string;
}
