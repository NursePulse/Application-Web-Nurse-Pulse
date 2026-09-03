import { Component, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { HttpErrorResponse } from "@angular/common/http";
import { TranslatePipe } from "@ngx-translate/core";
import { AuthStore } from "../../../application/auth.store";
import { LanguageSwitcherComponent } from "@shared/presentation/components/language-switcher/language-switcher";

@Component({
  selector: "app-sign-in",
  standalone: true,
  imports: [FormsModule, RouterLink, TranslatePipe, LanguageSwitcherComponent],
  templateUrl: "./sign-in.html",
  styleUrl: "./sign-in.css",
})
export class SignInComponent {
  private readonly router = inject(Router);
  protected readonly authStore = inject(AuthStore);

  protected username = "";
  protected password = "";
  protected readonly errorKey = signal<string | null>(null);

  protected submit(): void {
    if (this.authStore.loading()) return;

    const username = this.username.trim();
    if (!username || !this.password) {
      this.errorKey.set("access.errors.required");
      return;
    }

    this.errorKey.set(null);
    this.authStore.signIn({ username, password: this.password }).subscribe({
      next: () => this.router.navigate(["/dashboard"]),
      error: (error: unknown) => this.errorKey.set(this.toErrorKey(error)),
    });
  }

  private toErrorKey(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 401 || error.status === 404) {
        return "access.errors.invalidCredentials";
      }
      if (error.status === 0) {
        return "access.errors.network";
      }
    }
    return "access.errors.generic";
  }
}
