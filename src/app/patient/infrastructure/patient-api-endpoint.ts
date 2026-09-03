import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "@environments/environment";
import { PatientResponse } from "./patient-response";
import { RegisterPatientRequest } from "./register-patient.request";

@Injectable({ providedIn: "root" })
export class PatientApiEndpoint {
  private readonly baseUrl = `${environment.apiBaseUrl}/patients`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<PatientResponse[]> {
    return this.http.get<PatientResponse[]>(this.baseUrl);
  }

  getById(id: string): Observable<PatientResponse> {
    return this.http.get<PatientResponse>(`${this.baseUrl}/${id}`);
  }

  create(request: RegisterPatientRequest): Observable<PatientResponse> {
    return this.http.post<PatientResponse>(this.baseUrl, request);
  }

  update(
    id: string,
    request: RegisterPatientRequest,
  ): Observable<PatientResponse> {
    return this.http.put<PatientResponse>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
