import { AuditLog, AuditAction } from "../domain/model/audit-log.entity";
import { AuditLogResponse } from "./audit-log-response";

export class AuditAssembler {
  static toEntity(r: AuditLogResponse): AuditLog {
    const raw = r as any;
    const metadata = this.parseMetadata(raw.metadata);

    const action = this.resolveAction(raw, metadata);
    const description = this.resolveDescription(raw, metadata, action);

    return new AuditLog(
      String(raw.id),
      String(raw.code ?? `AL-${raw.id}`),
      String(raw.userId ?? raw.performedBy ?? "system"),
      this.cleanText(String(raw.username ?? raw.performedBy ?? "Sistema")),
      action,
      description,
      new Date(raw.performedAt ?? new Date()),
    );
  }

  static toEntityList(responses: AuditLogResponse[]): AuditLog[] {
    return responses.map((r) => this.toEntity(r));
  }

  private static resolveAction(
    raw: any,
    metadata: Record<string, unknown>,
  ): AuditAction {
    const rawAction = this.cleanText(
      String(raw.action ?? raw.actionType ?? ""),
    );
    const rawDescription = this.cleanText(
      String(
        raw.description ??
          raw.eventDescription ??
          metadata["description"] ??
          "",
      ),
    );
    const joined = `${rawAction} ${rawDescription}`.toLowerCase();

    if (joined.includes("reporte")) return AuditAction.REPORT_GENERATED;
    if (joined.includes("signo") || joined.includes("vital"))
      return AuditAction.VITAL_SIGN_RECORDED;
    if (
      joined.includes("sbar") ||
      joined.includes("handover") ||
      joined.includes("traspaso")
    )
      return AuditAction.SBAR_TRANSFER;
    if (joined.includes("alerta") && joined.includes("atendida"))
      return AuditAction.ALERT_ACKNOWLEDGED;
    if (joined.includes("alerta") && joined.includes("cerrada"))
      return AuditAction.ALERT_RESOLVED;
    if (joined.includes("alerta")) return AuditAction.ALERT_CREATED;
    if (joined.includes("evento clinico"))
      return AuditAction.CLINICAL_EVENT_REGISTERED;
    if (joined.includes("paciente")) return AuditAction.PATIENT_CREATED;
    if (joined.includes("transaccion"))
      return AuditAction.BUSINESS_TRANSACTION_EXECUTED;

    if (rawAction === "CREATE") return AuditAction.PATIENT_CREATED;
    if (rawAction === "VIEW") return AuditAction.AUDIT_EXECUTED;
    if (rawAction === "UPDATE")
      return AuditAction.BUSINESS_TRANSACTION_EXECUTED;
    if (rawAction === "CLINICAL_NOTE_ADDED")
      return AuditAction.CLINICAL_EVENT_REGISTERED;
    if (rawAction === "VITAL_SIGNS_RECORDED")
      return AuditAction.VITAL_SIGN_RECORDED;
    if (rawAction === "HANDOVER") return AuditAction.SBAR_TRANSFER;
    if (rawAction === "ALERT_TRIGGERED") return AuditAction.ALERT_CREATED;
    if (rawAction === "ALERT_ACKNOWLEDGED")
      return AuditAction.ALERT_ACKNOWLEDGED;
    if (rawAction === "ALERT_RESOLVED") return AuditAction.ALERT_RESOLVED;

    return AuditAction.AUDIT_EXECUTED;
  }

  private static resolveDescription(
    raw: any,
    metadata: Record<string, unknown>,
    action: AuditAction,
  ): string {
    const candidates = [
      raw.description,
      raw.eventDescription,
      metadata["description"],
      metadata["title"],
      metadata["message"],
      metadata["eventType"],
      raw.action,
      raw.actionType,
    ];

    const found = candidates
      .map((value) => this.cleanText(String(value ?? "")))
      .find((value) => value.length > 0);

    if (found) {
      return this.normalizeDescription(found);
    }

    return action;
  }

  private static normalizeDescription(value: string): string {
    const text = this.cleanText(value);
    const lower = text.toLowerCase();

    if (
      lower.includes("consolidaci") &&
      lower.includes("backend") &&
      lower.includes("reporte")
    ) {
      return "Transaccion: consolidacion de datos clinicos conectados al backend - reporte - auditoria";
    }

    if (lower.includes("gener") && lower.includes("reporte")) {
      return text.replace(/^.*reporte:/i, "Genero reporte:").trim();
    }

    return text;
  }

  private static parseMetadata(
    metadata?: string | Record<string, unknown> | null,
  ): Record<string, unknown> {
    if (!metadata) return {};
    if (typeof metadata === "object") return metadata;

    try {
      return JSON.parse(metadata);
    } catch {
      return { description: metadata };
    }
  }

  private static cleanText(value: string): string {
    let text = value ?? "";

    const replacements: Array<[RegExp, string]> = [
      [/\u00c3\u0192\u00c2\u00a1/g, "a"],
      [/\u00c3\u0192\u00c2\u00a9/g, "e"],
      [/\u00c3\u0192\u00c2\u00ad/g, "i"],
      [/\u00c3\u0192\u00c2\u00b3/g, "o"],
      [/\u00c3\u0192\u00c2\u00ba/g, "u"],
      [/\u00c3\u0192\u00c2\u00b1/g, "n"],

      [/\u00c3\u00a1/g, "a"],
      [/\u00c3\u00a9/g, "e"],
      [/\u00c3\u00ad/g, "i"],
      [/\u00c3\u00b3/g, "o"],
      [/\u00c3\u00ba/g, "u"],
      [/\u00c3\u00b1/g, "n"],

      [/\u00c2/g, ""],
      [/\u00e2\u2020\u2019/g, "-"],
      [/\u00e2\u20ac\u201c/g, "-"],
      [/\u00e2\u20ac\u009d/g, '"'],
      [/\u00e2\u20ac\u0153/g, '"'],
      [/\u00e2\u20ac\u2122/g, "'"],
    ];

    for (const [bad, good] of replacements) {
      text = text.replace(bad, good);
    }

    return text.replace(/\s+/g, " ").trim();
  }
}
