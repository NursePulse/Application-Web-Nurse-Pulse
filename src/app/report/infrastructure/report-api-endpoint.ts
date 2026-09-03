import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "@environments/environment";
import { ReportResponse } from "./report-response";

@Injectable({ providedIn: "root" })
export class ReportApiEndpoint {
  private readonly baseUrl = `${environment.apiBaseUrl}/reports`;
  constructor(private http: HttpClient) {}
  getAll(): Observable<ReportResponse[]> {
    return this.http.get<ReportResponse[]>(this.baseUrl);
  }
  generate(req: ReportResponse): Observable<ReportResponse> {
    return this.http.post<ReportResponse>(this.baseUrl, req);
  }
}
