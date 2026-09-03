import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "@environments/environment";
import { DashboardResponse } from "./dashboard-response";

@Injectable({ providedIn: "root" })
export class DashboardApiEndpoint {
  private readonly baseUrl = `${environment.apiBaseUrl}/dashboard`;
  constructor(private http: HttpClient) {}
  getSummary(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(`${this.baseUrl}/summary`);
  }
}
