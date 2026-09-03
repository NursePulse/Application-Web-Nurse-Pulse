import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { catchError, Observable, of } from "rxjs";
import { environment } from "@environments/environment";
import { SbarTransferResponse } from "./sbar-transfer-response";
import {
  AcknowledgeSbarRequest,
  RegisterSbarRequest,
} from "./register-sbar.request";

@Injectable({ providedIn: "root" })
export class SbarApiEndpoint {
  private readonly baseUrl = `${environment.apiBaseUrl}/handovers`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<SbarTransferResponse[]> {
    return this.http
      .get<SbarTransferResponse[]>(this.baseUrl)
      .pipe(catchError(() => of([])));
  }

  getByPatientId(patientId: string): Observable<SbarTransferResponse[]> {
    return this.http.get<SbarTransferResponse[]>(
      `${this.baseUrl}/patients/${patientId}`,
    );
  }

  getById(id: string): Observable<SbarTransferResponse> {
    return this.http.get<SbarTransferResponse>(`${this.baseUrl}/${id}`);
  }

  register(
    request: RegisterSbarRequest,
  ): Observable<SbarTransferResponse | number> {
    return this.http.post<SbarTransferResponse | number>(this.baseUrl, request);
  }

  acknowledge(
    id: string,
    request: AcknowledgeSbarRequest,
  ): Observable<SbarTransferResponse> {
    return this.http.patch<SbarTransferResponse>(
      `${this.baseUrl}/${id}/acknowledge`,
      request,
    );
  }
}
