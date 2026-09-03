import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { map, Observable } from "rxjs";
import { environment } from "@environments/environment";
import {
  AuditLogPageResponse,
  AuditLogResponse,
  CreateAuditLogRequest,
} from "./audit-log-response";

@Injectable({ providedIn: "root" })
export class AuditApiEndpoint {
  private readonly baseUrl = `${environment.apiBaseUrl}/audit-logs`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<AuditLogResponse[]> {
    return this.http
      .get<
        AuditLogPageResponse | AuditLogResponse[]
      >(`${this.baseUrl}?page=0&size=100`)
      .pipe(
        map((response) =>
          Array.isArray(response) ? response : response.content,
        ),
      );
  }

  create(request: CreateAuditLogRequest): Observable<AuditLogResponse> {
    return this.http.post<AuditLogResponse>(this.baseUrl, request);
  }
}
