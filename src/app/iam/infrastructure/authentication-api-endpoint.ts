import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "@environments/environment";
import { SignInRequest } from "./sign-in.request";
import { SignUpRequest } from "./sign-up.request";
import { AuthenticatedUserResponse } from "./authenticated-user-response";
import { UserResponse } from "./user-response";

@Injectable({ providedIn: "root" })
export class AuthenticationApiEndpoint {
  private readonly baseUrl = `${environment.apiBaseUrl}/authentication`;

  constructor(private http: HttpClient) {}

  signIn(request: SignInRequest): Observable<AuthenticatedUserResponse> {
    return this.http.post<AuthenticatedUserResponse>(
      `${this.baseUrl}/sign-in`,
      request,
    );
  }

  signUp(request: SignUpRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.baseUrl}/sign-up`, request);
  }
}
