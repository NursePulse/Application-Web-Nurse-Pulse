import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "@environments/environment";
import {
  AlertResponse,
  AttendAlertRequest,
  CloseAlertRequest,
  CreateAlertRequest,
} from "./alert-response";

@Injectable({ providedIn: "root" })
export class NotificationApiEndpoint {
  private readonly baseUrl = `${environment.apiBaseUrl}/alerts`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<AlertResponse[]> {
    return this.http.get<AlertResponse[]>(this.baseUrl);
  }

  getByPatientId(patientId: string): Observable<AlertResponse[]> {
    return this.http.get<AlertResponse[]>(
      `${this.baseUrl}/patients/${patientId}`,
    );
  }

  create(request: CreateAlertRequest): Observable<AlertResponse> {
    return this.http.post<AlertResponse>(this.baseUrl, request);
  }

  acknowledge(id: string, userName: string): Observable<AlertResponse> {
    const request: AttendAlertRequest = {
      attendedBy: userName,
    };

    return this.http.patch<AlertResponse>(
      `${this.baseUrl}/${id}/attend`,
      request,
    );
  }

  resolve(
    id: string,
    userName: string,
    note = "Alerta cerrada desde seguimiento clínico.",
  ): Observable<AlertResponse> {
    const request: CloseAlertRequest = {
      closedBy: userName,
      resolutionNotes: note,
    };

    return this.http.patch<AlertResponse>(
      `${this.baseUrl}/${id}/close`,
      request,
    );
  }
}
