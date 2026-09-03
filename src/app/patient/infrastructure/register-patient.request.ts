import { PatientStatusEnum } from "../domain/model/patient.entity";

export interface RegisterPatientRequest {
  firstName: string;
  lastName: string;
  documentNumber: string;
  birthDate: string;
  gender: string;
  diagnosis: string;
  roomNumber: string;
  bedNumber: string;
  attendingPhysician: string;
  status?: PatientStatusEnum;
  admissionDate?: string;
}
