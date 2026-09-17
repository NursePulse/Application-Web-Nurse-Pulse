export type PasswordRecoveryMethod = "email" | "phone";

export interface ForgotPasswordRequest {
    method: PasswordRecoveryMethod;
    value: string;
}

export interface VerificationStartResponse {
    verificationId: string;
    maskedDestination: string;
    expiresIn: number;
    resendAfter: number;
}

export interface VerifyCodeRequest {
    verificationId: string;
    code: string;
    purpose: "password_recovery";
}

export interface VerifyCodeResponse {
    resetToken: string;
}