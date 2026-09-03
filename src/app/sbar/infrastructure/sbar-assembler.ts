import { SbarTransfer } from "../domain/model/sbar-transfer.entity";
import { SbarTransferResponse } from "./sbar-transfer-response";
import { RegisterSbarCommand } from "../domain/model/register-sbar.command";
import { RegisterSbarRequest } from "./register-sbar.request";

interface ParsedSbar {
  receiverId: string;
  receiverName: string;
  situation: string;
  background: string;
  assessment: string;
  recommendation: string;
}

export class SbarAssembler {
  static toEntity(
    response: SbarTransferResponse,
    patientName?: string,
  ): SbarTransfer {
    const parsed = this.parseDescription(response.description);

    return new SbarTransfer(
      String(response.id),
      String(response.patientId),
      patientName ?? `Paciente #${response.patientId}`,
      "system",
      "Equipo clínico",
      parsed.receiverId,
      parsed.receiverName,
      parsed.situation,
      parsed.background,
      parsed.assessment,
      parsed.recommendation,
      response.transferredAt ? new Date(response.transferredAt) : new Date(),
      response.status,
      response.additionalNotes,
    );
  }

  static toEntityList(
    responses: SbarTransferResponse[],
    resolvePatientName?: (patientId: string) => string,
  ): SbarTransfer[] {
    return responses.map((response) =>
      this.toEntity(response, resolvePatientName?.(String(response.patientId))),
    );
  }

  static toRequest(command: RegisterSbarCommand): RegisterSbarRequest {
    return {
      patientId: Number(command.patientId),
      title: "SBAR clinical handover",
      description: this.buildDescription(
        command.targetNurseId,
        "Equipo receptor",
        command.situation,
        command.background,
        command.assessment,
        command.recommendation,
      ),
    };
  }

  static buildDescription(
    receiverId: string,
    receiverName: string,
    situation: string,
    background: string,
    assessment: string,
    recommendation: string,
  ): string {
    return [
      `ReceiverId: ${receiverId}`,
      `ReceiverName: ${receiverName}`,
      `Situation: ${situation}`,
      `Background: ${background}`,
      `Assessment: ${assessment}`,
      `Recommendation: ${recommendation}`,
    ].join("\n");
  }

  private static parseDescription(description: string): ParsedSbar {
    return {
      receiverId: this.extract(description, "ReceiverId") ?? "2",
      receiverName:
        this.extract(description, "ReceiverName") ?? "Equipo receptor",
      situation: this.extract(description, "Situation") ?? description,
      background:
        this.extract(description, "Background") ??
        "Sin antecedentes registrados.",
      assessment:
        this.extract(description, "Assessment") ?? "Sin evaluación registrada.",
      recommendation:
        this.extract(description, "Recommendation") ??
        "Sin recomendación registrada.",
    };
  }

  private static extract(text: string, label: string): string | null {
    const regex = new RegExp(
      `${label}:\\\\s*([\\\\s\\\\S]*?)(?=\\\\n[A-Za-z]+:|$)`,
      "i",
    );
    const match = text.match(regex);
    return match?.[1]?.trim() || null;
  }
}
