import { Injectable, computed, inject, signal } from "@angular/core";
import { Observable, finalize, map, tap } from "rxjs";
import { ViewMode, ViewModeStore } from "@shared/application/view-mode.store";
import { User, UserRole } from "../domain/model/user.entity";
import { AuthenticationApiEndpoint } from "../infrastructure/authentication-api-endpoint";
import { TokenStorage } from "../infrastructure/token.storage";
import { UserAssembler } from "../infrastructure/user-assembler";
import { SignInRequest } from "../infrastructure/sign-in.request";
import { SignUpRequest } from "../infrastructure/sign-up.request";

const ROLE_TO_VIEW_MODE: Record<UserRole, ViewMode> = {
  ROLE_ADMIN: "admin",
  ROLE_DOCTOR: "doctor",
  ROLE_NURSE: "nurse",
};

@Injectable({ providedIn: "root" })
export class AuthStore {
  private readonly api = inject(AuthenticationApiEndpoint);
  private readonly tokenStorage = inject(TokenStorage);
  private readonly viewModeStore = inject(ViewModeStore);

  private readonly currentUser = signal<User | null>(this.restoreUser());
  private readonly currentToken = signal<string | null>(
    this.tokenStorage.getToken(),
  );

  readonly user = this.currentUser.asReadonly();
  readonly token = this.currentToken.asReadonly();
  readonly isAuthenticated = computed(
    () => this.currentToken() !== null && this.currentUser() !== null,
  );
  readonly loading = signal(false);

  signIn(request: SignInRequest): Observable<User> {
    this.loading.set(true);
    return this.api.signIn(request).pipe(
      tap((response) =>
        this.openSession(response.token, UserAssembler.toEntity(response)),
      ),
      map((response) => UserAssembler.toEntity(response)),
      finalize(() => this.loading.set(false)),
    );
  }

  signUp(request: SignUpRequest): Observable<User> {
    this.loading.set(true);
    return this.api.signUp(request).pipe(
      map((response) => UserAssembler.toEntity(response)),
      finalize(() => this.loading.set(false)),
    );
  }

  signOut(): void {
    this.tokenStorage.clear();
    this.currentUser.set(null);
    this.currentToken.set(null);
    this.viewModeStore.clearMode();
  }

  hasAnyRole(roles: UserRole[]): boolean {
    const user = this.currentUser();
    return user !== null && user.hasAnyRole(roles);
  }

  private openSession(token: string, user: User): void {
    this.tokenStorage.saveSession(token, {
      id: user.id,
      username: user.username,
      roles: user.roles,
    });
    this.currentToken.set(token);
    this.currentUser.set(user);
    this.viewModeStore.setMode(ROLE_TO_VIEW_MODE[user.primaryRole]);
  }

  private restoreUser(): User | null {
    const stored = this.tokenStorage.getUser();
    if (!stored) return null;
    return new User(stored.id, stored.username, stored.roles);
  }
}
