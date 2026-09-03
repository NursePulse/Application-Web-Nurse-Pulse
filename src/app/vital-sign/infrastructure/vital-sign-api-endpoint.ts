import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "@environments/environment";
import { VitalSignResponse } from "./vital-sign-response";
import { RecordVitalSignRequest } from "./record-vital-sign.request";

@Injectable({ providedIn: "root" })
export class VitalSignApiEndpoint {
  private readonly baseUrl = `${environment.apiBaseUrl}/vital-sign-records`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<VitalSignResponse[]> {
    return this.http.get<VitalSignResponse[]>(this.baseUrl);
  }

  getByPatientId(patientId: string): Observable<VitalSignResponse[]> {
    return this.http.get<VitalSignResponse[]>(
      `${this.baseUrl}/patients/${patientId}`,
    );
  }

  getLatestByPatientId(patientId: string): Observable<VitalSignResponse> {
    return this.http.get<VitalSignResponse>(
      `${this.baseUrl}/patients/${patientId}/latest`,
    );
  }

  record(request: RecordVitalSignRequest): Observable<VitalSignResponse> {
    return this.http.post<VitalSignResponse>(this.baseUrl, request);
  }
}
