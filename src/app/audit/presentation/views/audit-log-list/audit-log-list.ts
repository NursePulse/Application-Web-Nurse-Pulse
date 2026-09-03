import { Component, inject, OnInit } from "@angular/core";
import { DatePipe } from "@angular/common";
import { AuditStore } from "../../../application/audit.store";
import { TranslatePipe } from "@ngx-translate/core";

@Component({
  selector: "app-audit-log-list",
  standalone: true,
  imports: [TranslatePipe, DatePipe],
  templateUrl: "./audit-log-list.html",
  styleUrl: "./audit-log-list.css",
})
export class AuditLogListComponent implements OnInit {
  protected store = inject(AuditStore);
  ngOnInit(): void {
    this.store.loadLogs();
  }
}
