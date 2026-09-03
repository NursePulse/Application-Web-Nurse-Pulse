import {
  Report,
  ReportType,
  ReportStatus,
} from "../domain/model/report.entity";
import { ReportResponse } from "./report-response";
import { GenerateReportCommand } from "../domain/model/generate-report.command";
import { GenerateReportRequest } from "./generate-report.request";

export class ReportAssembler {
  static toEntity(r: ReportResponse): Report {
    return new Report(
      r.id,
      r.type as ReportType,
      r.title,
      r.generatedBy,
      new Date(r.startDate),
      new Date(r.endDate),
      r.status as ReportStatus,
      new Date(r.createdAt),
      r.summary,
      r.clinicalConclusion,
    );
  }

  static toEntityList(responses: ReportResponse[]): Report[] {
    return responses.map((r) => this.toEntity(r));
  }

  static toRequest(cmd: GenerateReportCommand): GenerateReportRequest {
    return {
      type: cmd.type,
      title: cmd.title,
      startDate: cmd.startDate.toISOString(),
      endDate: cmd.endDate.toISOString(),
    };
  }
}
