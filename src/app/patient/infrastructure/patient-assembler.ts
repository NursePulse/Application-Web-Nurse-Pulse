import { Patient } from "../domain/model/patient.entity";
import { PatientResponse } from "./patient-response";

export class PatientAssembler {
  static toEntity(response: PatientResponse): Patient {
    return new Patient(
      String(response.id),
      response.firstName,
      response.lastName,
      response.documentNumber,
      new Date(response.birthDate),
      response.gender,
      response.diagnosis,
      response.roomNumber,
      response.bedNumber,
      response.attendingPhysician,
      response.status,
      new Date(response.admissionDate),
    );
  }

  static toEntityList(responses: PatientResponse[]): Patient[] {
    return responses.map((response) => PatientAssembler.toEntity(response));
  }
}
