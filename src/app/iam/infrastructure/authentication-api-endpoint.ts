import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "@environments/environment";
import { SignInRequest } from "./sign-in.request";
import { SignUpRequest } from "./sign-up.request";
import { AuthenticatedUserResponse } from "./authenticated-user-response";
import { UserResponse } from "./user-response";
import {
  ForgotPasswordRequest,
  VerificationStartResponse,
  VerifyCodeRequest,
  VerifyCodeResponse,
} from "./forgot-password.request";

@Injectable({ providedIn: "root" })
export class AuthenticationApiEndpoint {
  private readonly baseUrl = `${environment.apiBaseUrl}/authentication`;

  constructor(private http: HttpClient) { }

  signIn(request: SignInRequest): Observable<AuthenticatedUserResponse> {
    return this.http.post<AuthenticatedUserResponse>(
      `${this.baseUrl}/sign-in`,
      request,
    );
  }

  signUp(request: SignUpRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.baseUrl}/sign-up`, request);
  }

  requestPasswordRecovery(request: ForgotPasswordRequest): Observable<VerificationStartResponse> {
    return this.http.post<VerificationStartResponse>(`${this.baseUrl}/forgot-password`, request);
  }

  verifyRecoveryCode(request: VerifyCodeRequest): Observable<VerifyCodeResponse> {
    return this.http.post<VerifyCodeResponse>(`${this.baseUrl}/verify-code`, request);
  }

  resendRecoveryCode(verificationId: string): Observable<VerificationStartResponse> {
    return this.http.post<VerificationStartResponse>(`${this.baseUrl}/resend-code`, {
      verificationId,
      purpose: "password_recovery",
    });
  }
}
