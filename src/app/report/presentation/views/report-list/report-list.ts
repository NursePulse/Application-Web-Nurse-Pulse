import { Component, HostListener, inject, OnInit, signal } from "@angular/core";
import { DatePipe } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ReportStore } from "../../../application/report.store";
import {
  Report,
  ReportSummary,
  ReportType,
} from "../../../domain/model/report.entity";
import { TranslatePipe, TranslateService } from "@ngx-translate/core";

@Component({
  selector: "app-report-list",
  standalone: true,
  imports: [TranslatePipe, DatePipe, FormsModule],
  templateUrl: "./report-list.html",
  styleUrl: "./report-list.css",
})
export class ReportListComponent implements OnInit {
  protected store = inject(ReportStore);
  private translate = inject(TranslateService);

  showForm = signal(false);
  errorMessage = signal<string | null>(null);
  selectedReport = signal<Report | null>(null);

  types = Object.values(ReportType);

  form = this.emptyForm();

  ngOnInit(): void {
    this.store.loadReports();
  }

  openForm(): void {
    this.errorMessage.set(null);
    this.form = this.emptyForm();
    this.showForm.set(true);
  }

  save(): void {
    this.errorMessage.set(this.validateForm());
    if (this.errorMessage()) return;

    this.store.generateReport({
      ...this.form,
      startDate: new Date(this.form.startDate).toISOString(),
      endDate: new Date(`${this.form.endDate}T23:59:59`).toISOString(),
    });

    this.form = this.emptyForm();
    this.showForm.set(false);
  }

  openDetail(report: Report): void {
    this.selectedReport.set(report);
  }

  closeDetail(): void {
    this.selectedReport.set(null);
  }

  reportTone(report: Report): "critical" | "attention" | "stable" {
    const summary = report.summary;
    if (summary?.criticalAlerts) return "critical";
    if (summary?.activeAlerts) return "attention";
    return "stable";
  }

  reportToneKey(report: Report): string {
    const tone = this.reportTone(report);
    if (tone === "critical") return "reports.detail.critical";
    if (tone === "attention") return "reports.detail.attention";
    return "reports.detail.stable";
  }

  activityTotal(summary: ReportSummary): number {
    return (
      summary.vitalSigns +
      summary.clinicalEvents +
      summary.sbarTransfers +
      summary.activeAlerts +
      summary.auditLogs
    );
  }

  @HostListener("document:keydown.escape")
  closeDetailOnEscape(): void {
    this.closeDetail();
  }

  private emptyForm() {
    const today = new Date();
    const start = new Date();
    start.setDate(today.getDate() - 7);

    return {
      type: ReportType.GENERAL,
      title: "",
      startDate: start.toISOString().slice(0, 10),
      endDate: today.toISOString().slice(0, 10),
    };
  }

  private validateForm(): string | null {
    if (!this.form.title.trim())
      return this.translate.instant("reports.validation.titleRequired");
    if (!this.form.startDate || !this.form.endDate)
      return this.translate.instant("reports.validation.dateRequired");

    const start = new Date(this.form.startDate).getTime();
    const end = new Date(this.form.endDate).getTime();

    if (start > end)
      return this.translate.instant("reports.validation.invalidRange");

    return null;
  }
}
