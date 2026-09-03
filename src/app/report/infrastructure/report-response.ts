import { ReportSummary } from "../domain/model/report.entity";

export interface ReportResponse {
  id: string;
  type: string;
  title: string;
  generatedBy: string;
  startDate: string;
  endDate: string;
  status: string;
  createdAt: string;
  summary?: ReportSummary;
  clinicalConclusion?: string;
}
