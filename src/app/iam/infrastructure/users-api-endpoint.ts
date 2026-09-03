import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "@environments/environment";
import { UserResponse } from "./user-response";

@Injectable({ providedIn: "root" })
export class UsersApiEndpoint {
  private readonly baseUrl = `${environment.apiBaseUrl}/users`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(this.baseUrl);
  }

  updateRoles(userId: string, roles: string[]): Observable<UserResponse> {
    return this.http.patch<UserResponse>(`${this.baseUrl}/${userId}/roles`, {
      roles,
    });
  }
}
