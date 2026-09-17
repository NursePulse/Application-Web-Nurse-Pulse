import { SbarTransfer } from "../domain/model/sbar-transfer.entity";
import { SbarTransferResponse } from "./sbar-transfer-response";
import { RegisterSbarCommand } from "../domain/model/register-sbar.command";
import { RegisterSbarRequest } from "./register-sbar.request";

export class SbarAssembler {
  static toEntity(
    response: SbarTransferResponse,
    patientName?: string,
    receiverName?: string,
  ): SbarTransfer {
    return new SbarTransfer(
      String(response.id),
      String(response.patientId),
      patientName ?? `Paciente #${response.patientId}`,
      "system",
      response.registeredBy ?? "Equipo clínico",
      response.targetNurseId != null ? String(response.targetNurseId) : "",
      receiverName ?? "Equipo receptor",
      response.situation ?? "",
      response.background ?? "",
      response.assessment ?? "",
      response.recommendation ?? "",
      new Date(response.createdAt ?? response.transferredAt ?? Date.now()),
      response.status,
      response.additionalNotes,
    );
  }

  static toEntityList(
    responses: SbarTransferResponse[],
    resolvePatientName?: (patientId: string) => string,
    resolveReceiverName?: (targetNurseId: string) => string,
  ): SbarTransfer[] {
    return responses.map((response) =>
      this.toEntity(
        response,
        resolvePatientName?.(String(response.patientId)),
        response.targetNurseId != null
          ? resolveReceiverName?.(String(response.targetNurseId))
          : undefined,
      ),
    );
  }

  static toRequest(command: RegisterSbarCommand): RegisterSbarRequest {
    return {
      patientId: Number(command.patientId),
      title: "SBAR clinical handover",
      situation: command.situation,
      background: command.background,
      assessment: command.assessment,
      recommendation: command.recommendation,
      targetNurseId: command.targetNurseId
        ? Number(command.targetNurseId)
        : undefined,
    };
  }
}
