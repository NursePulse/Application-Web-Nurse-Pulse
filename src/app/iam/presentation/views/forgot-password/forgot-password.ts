import { Component, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { HttpErrorResponse } from "@angular/common/http";
import { TranslatePipe } from "@ngx-translate/core";
import { AuthStore } from "../../../application/auth.store";
import { PasswordRecoveryMethod } from "../../../infrastructure/forgot-password.request";
import { LanguageSwitcherComponent } from "@shared/presentation/components/language-switcher/language-switcher";

@Component({
    selector: "app-forgot-password",
    standalone: true,
    imports: [FormsModule, RouterLink, TranslatePipe, LanguageSwitcherComponent],
    templateUrl: "./forgot-password.html",
    styleUrls: ["../sign-in/sign-in.css", "./forgot-password.css"],
})
export class ForgotPasswordComponent {
    private readonly router = inject(Router);
    protected readonly authStore = inject(AuthStore);

    protected method: PasswordRecoveryMethod = "email";
    protected value = "";
    protected readonly errorKey = signal<string | null>(null);
    protected readonly sent = signal(false);

    protected submit(): void {
        if (this.authStore.loading()) return;

        const value = this.value.trim();
        if (!value) {
            this.errorKey.set("access.errors.recoveryRequired");
            return;
        }
        if (this.method === "email" && !/^\S+@\S+\.\S+$/.test(value)) {
            this.errorKey.set("access.errors.recoveryEmail");
            return;
        }
        if (this.method === "phone" && !/^\d{9}$/.test(value)) {
            this.errorKey.set("access.errors.recoveryPhone");
            return;
        }

        this.errorKey.set(null);
        this.authStore.requestPasswordRecovery({ method: this.method, value }).subscribe({
            next: (response) => this.router.navigate(["/verify-code"], {
                queryParams: {
                    verificationId: response.verificationId,
                    destination: response.maskedDestination,
                    expiresIn: response.expiresIn,
                    resendAfter: response.resendAfter,
                },
            }),
            error: (error: unknown) => this.errorKey.set(this.toErrorKey(error)),
        });
    }

    protected resetForm(): void {
        this.sent.set(false);
        this.value = "";
    }

    protected sanitizeValue(): void {
        if (this.method === "phone") {
            this.value = this.value.replace(/\D/g, "").slice(0, 9);
        }
    }

    private toErrorKey(error: unknown): string {
        if (error instanceof HttpErrorResponse && error.status === 0) {
            return "access.errors.network";
        }
        return "access.errors.generic";
    }
}