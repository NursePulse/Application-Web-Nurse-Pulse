import { Component, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { HttpErrorResponse } from "@angular/common/http";
import { TranslatePipe } from "@ngx-translate/core";
import { switchMap } from "rxjs";
import { AuthStore } from "../../../application/auth.store";
import { ClinicalRegistrationRole } from "../../../infrastructure/sign-up.request";
import { LanguageSwitcherComponent } from "@shared/presentation/components/language-switcher/language-switcher";

@Component({
  selector: "app-sign-up",
  standalone: true,
  imports: [FormsModule, RouterLink, TranslatePipe, LanguageSwitcherComponent],
  templateUrl: "./sign-up.html",
  styleUrls: ["../sign-in/sign-in.css", "./sign-up.css"],
})
export class SignUpComponent {
  private readonly router = inject(Router);
  protected readonly authStore = inject(AuthStore);

  protected username = "";
  protected password = "";
  protected confirmPassword = "";
  protected selectedRole: ClinicalRegistrationRole = "ROLE_NURSE";
  protected readonly errorKey = signal<string | null>(null);

  protected submit(): void {
    if (this.authStore.loading()) return;

    const username = this.username.trim();
    if (!username || !this.password || !this.confirmPassword) {
      this.errorKey.set("access.errors.required");
      return;
    }
    if (this.password.length < 8) {
      this.errorKey.set("access.errors.passwordLength");
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.errorKey.set("access.errors.passwordMismatch");
      return;
    }

    this.errorKey.set(null);
    const credentials = { username, password: this.password };
    this.authStore
      .signUp({ ...credentials, role: this.selectedRole })
      .pipe(switchMap(() => this.authStore.signIn(credentials)))
      .subscribe({
        next: () => this.router.navigate(["/dashboard"]),
        error: (error: unknown) => this.errorKey.set(this.toErrorKey(error)),
      });
  }

  private toErrorKey(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 409 || error.status === 400) {
        return "access.errors.usernameTaken";
      }
      if (error.status === 0) {
        return "access.errors.network";
      }
    }
    return "access.errors.generic";
  }
}
