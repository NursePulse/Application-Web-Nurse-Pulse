export enum AuditAction {
  VITAL_SIGN_RECORDED = "Registro signos vitales",
  CLINICAL_EVENT_REGISTERED = "Registro evento clinico",
  SBAR_TRANSFER = "Traspaso SBAR registrado",
  AUDIT_EXECUTED = "Auditoria de eventos ejecutada",
  DASHBOARD_ACCESSED = "Dashboard administrativo consultado",
  PATIENT_CREATED = "Paciente registrado",
  REPORT_GENERATED = "Reporte generado",
  ALERT_CREATED = "Alerta automatica generada",
  ALERT_ACKNOWLEDGED = "Alerta atendida",
  ALERT_RESOLVED = "Alerta cerrada",
  BUSINESS_TRANSACTION_EXECUTED = "Transaccion clinica ejecutada",
}

export type AuditActionType =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "VIEW"
  | "SIGN"
  | "HANDOVER"
  | "ALERT_TRIGGERED"
  | "ALERT_ACKNOWLEDGED"
  | "ALERT_RESOLVED"
  | "VITAL_SIGNS_RECORDED"
  | "CLINICAL_NOTE_ADDED";

export const AuditActionType = {
  CREATE: "CREATE" as AuditActionType,
  UPDATE: "UPDATE" as AuditActionType,
  DELETE: "DELETE" as AuditActionType,
  VIEW: "VIEW" as AuditActionType,
  SIGN: "SIGN" as AuditActionType,
  HANDOVER: "HANDOVER" as AuditActionType,
  ALERT_TRIGGERED: "ALERT_TRIGGERED" as AuditActionType,
  ALERT_ACKNOWLEDGED: "ALERT_ACKNOWLEDGED" as AuditActionType,
  ALERT_RESOLVED: "ALERT_RESOLVED" as AuditActionType,
  VITAL_SIGNS_RECORDED: "VITAL_SIGNS_RECORDED" as AuditActionType,
  CLINICAL_NOTE_ADDED: "CLINICAL_NOTE_ADDED" as AuditActionType,
};

export type AuditedEntityType =
  | "PATIENT"
  | "ALERT"
  | "VITAL_SIGNS"
  | "VITAL_SIGN_RECORD"
  | "CLINICAL_EVENT"
  | "SBAR_HANDOVER"
  | "HANDOVER"
  | "REPORT"
  | "AUDIT_LOG"
  | "SYSTEM";

export const AuditedEntityType = {
  PATIENT: "PATIENT" as AuditedEntityType,
  ALERT: "ALERT" as AuditedEntityType,
  VITAL_SIGNS: "VITAL_SIGNS" as AuditedEntityType,
  VITAL_SIGN_RECORD: "VITAL_SIGN_RECORD" as AuditedEntityType,
  CLINICAL_EVENT: "CLINICAL_EVENT" as AuditedEntityType,
  SBAR_HANDOVER: "SBAR_HANDOVER" as AuditedEntityType,
  HANDOVER: "HANDOVER" as AuditedEntityType,
  REPORT: "REPORT" as AuditedEntityType,
  AUDIT_LOG: "AUDIT_LOG" as AuditedEntityType,
  SYSTEM: "SYSTEM" as AuditedEntityType,
};

export class AuditLog {
  constructor(
    public readonly id: string,
    public readonly code: string,
    public readonly userId: string,
    public readonly username: string,
    public readonly action: AuditAction,
    public readonly description: string,
    public readonly performedAt: Date,
  ) {}

  get actionLabel(): string {
    return this.action;
  }
}
