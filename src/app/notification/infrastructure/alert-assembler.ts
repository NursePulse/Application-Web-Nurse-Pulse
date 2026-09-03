import {
  Alert,
  AlertSeverity,
  AlertStatus,
  AlertType,
} from "../domain/model/alert.entity";
import { AlertResponse } from "./alert-response";

export class AlertAssembler {
  static toEntity(response: AlertResponse, patientName?: string): Alert {
    const triggeredAt =
      response.triggeredAt ??
      response.attendedAt ??
      response.closedAt ??
      new Date().toISOString();

    return new Alert(
      String(response.id),
      String(response.patientId),
      patientName ?? `Paciente #${response.patientId}`,
      response.type as AlertType,
      response.severity as AlertSeverity,
      response.description,
      response.status as AlertStatus,
      response.triggeredBy,
      new Date(triggeredAt),
      response.attendedBy,
      response.attendedAt ? new Date(response.attendedAt) : undefined,
      response.closedBy,
      response.resolutionNotes,
      response.closedAt ? new Date(response.closedAt) : undefined,
    );
  }

  static toEntityList(
    responses: AlertResponse[],
    resolvePatientName?: (patientId: string) => string,
  ): Alert[] {
    return responses.map((response) =>
      this.toEntity(response, resolvePatientName?.(String(response.patientId))),
    );
  }
}
