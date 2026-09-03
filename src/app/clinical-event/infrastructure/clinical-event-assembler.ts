import {
  ClinicalEvent,
  ClinicalEventType,
  ClinicalEventSeverity,
} from "../domain/model/clinical-event.entity";
import { ClinicalEventResponse } from "./clinical-event-response";
import { RegisterClinicalEventRequest } from "./register-clinical-event.request";

export class ClinicalEventAssembler {
  static toEntity(
    response: ClinicalEventResponse,
    patientName: string,
  ): ClinicalEvent {
    return new ClinicalEvent(
      String(response.id),
      String(response.patientId),
      patientName,
      response.registeredBy,
      response.registeredBy,
      ClinicalEventType[response.eventType as keyof typeof ClinicalEventType] ??
        ClinicalEventType.OBSERVATION,
      ClinicalEventSeverity[
        response.severity as keyof typeof ClinicalEventSeverity
      ] ?? ClinicalEventSeverity.LOW,
      response.title,
      response.description,
      new Date(response.occurredAt),
    );
  }

  static toRequest(form: {
    patientId: string;
    eventType: string;
    severity: string;
    title: string;
    description: string;
  }): RegisterClinicalEventRequest {
    return {
      patientId: Number(form.patientId),
      eventType: ClinicalEventAssembler.typeKey(form.eventType),
      severity: ClinicalEventAssembler.severityKey(form.severity),
      title: form.title,
      description: form.description,
    };
  }

  private static typeKey(value: string): string {
    return (
      Object.entries(ClinicalEventType).find(([, v]) => v === value)?.[0] ??
      "OBSERVATION"
    );
  }

  private static severityKey(value: string): string {
    return (
      Object.entries(ClinicalEventSeverity).find(([, v]) => v === value)?.[0] ??
      "LOW"
    );
  }
}
