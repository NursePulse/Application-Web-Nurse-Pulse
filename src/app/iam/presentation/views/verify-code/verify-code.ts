import { Component, OnDestroy, OnInit, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { HttpErrorResponse } from "@angular/common/http";
import { TranslatePipe } from "@ngx-translate/core";
import { AuthStore } from "../../../application/auth.store";
import { LanguageSwitcherComponent } from "@shared/presentation/components/language-switcher/language-switcher";

@Component({
    selector: "app-verify-code",
    standalone: true,
    imports: [FormsModule, RouterLink, TranslatePipe, LanguageSwitcherComponent],
    templateUrl: "./verify-code.html",
    styleUrls: ["../sign-in/sign-in.css", "./verify-code.css"],
})
export class VerifyCodeComponent implements OnInit, OnDestroy {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    protected readonly authStore = inject(AuthStore);
    protected verificationId = "";
    protected destination = "";
    protected code = "";
    protected secondsLeft = 0;
    protected readonly verified = signal(false);
    protected readonly errorKey = signal<string | null>(null);
    private timerId: ReturnType<typeof setInterval> | null = null;

    ngOnInit(): void {
        const params = this.route.snapshot.queryParamMap;
        this.verificationId = params.get("verificationId") ?? "";
        this.destination = params.get("destination") ?? "";
        this.secondsLeft = Number(params.get("resendAfter") ?? 60);
        if (!this.verificationId) {
            this.router.navigate(["/forgot-password"]);
            return;
        }
        this.startTimer();
    }

    ngOnDestroy(): void {
        this.stopTimer();
    }

    protected sanitizeCode(): void {
        this.code = this.code.replace(/\D/g, "").slice(0, 6);
    }

    protected submit(): void {
        if (this.authStore.loading()) return;
        if (!/^\d{6}$/.test(this.code)) {
            this.errorKey.set("access.errors.verificationCode");
            return;
        }

        this.errorKey.set(null);
        this.authStore.verifyRecoveryCode({
            verificationId: this.verificationId,
            code: this.code,
            purpose: "password_recovery",
        }).subscribe({
            next: () => this.verified.set(true),
            error: (error: unknown) => this.errorKey.set(this.toErrorKey(error)),
        });
    }

    protected resend(): void {
        if (this.secondsLeft > 0 || this.authStore.loading()) return;
        this.errorKey.set(null);
        this.authStore.resendRecoveryCode(this.verificationId).subscribe({
            next: (response) => {
                this.verificationId = response.verificationId;
                this.destination = response.maskedDestination;
                this.secondsLeft = response.resendAfter;
                this.code = "";
                this.startTimer();
            },
            error: (error: unknown) => this.errorKey.set(this.toErrorKey(error)),
        });
    }

    private startTimer(): void {
        this.stopTimer();
        this.timerId = setInterval(() => {
            if (this.secondsLeft <= 0) {
                this.stopTimer();
                return;
            }
            this.secondsLeft -= 1;
        }, 1000);
    }

    private stopTimer(): void {
        if (this.timerId !== null) {
            clearInterval(this.timerId);
            this.timerId = null;
        }
    }

    private toErrorKey(error: unknown): string {
        if (error instanceof HttpErrorResponse) {
            if (error.status === 400 || error.status === 401 || error.status === 422) {
                return "access.errors.verificationInvalid";
            }
            if (error.status === 429) return "access.errors.verificationAttempts";
            if (error.status === 0) return "access.errors.network";
        }
        return "access.errors.generic";
    }
}