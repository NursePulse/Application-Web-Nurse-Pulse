import {
  AuditActionType,
  AuditedEntityType,
} from "../domain/model/audit-log.entity";

export interface AuditLogResponse {
  id: string | number;
  patientId?: string | number | null;
  entityType: AuditedEntityType | string;
  entityId: string;
  actionType: AuditActionType | string;
  performedBy: string;
  performedAt: string;
  metadata?: string | Record<string, unknown> | null;
  createdAt?: string;
}

export interface AuditLogPageResponse {
  content: AuditLogResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface CreateAuditLogRequest {
  patientId?: number | null;
  entityType: AuditedEntityType;
  entityId: string;
  actionType: AuditActionType;
  performedBy: string;
  performedAt?: string;
  metadata?: Record<string, unknown>;
}
