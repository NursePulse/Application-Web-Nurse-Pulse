import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthStore } from "../application/auth.store";
import { UserRole } from "../domain/model/user.entity";

export const authGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);
  return authStore.isAuthenticated() ? true : router.parseUrl("/sign-in");
};

export const guestGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);
  return authStore.isAuthenticated() ? router.parseUrl("/dashboard") : true;
};

export const roleGuard =
  (roles: UserRole[]): CanActivateFn =>
  () => {
    const authStore = inject(AuthStore);
    const router = inject(Router);
    return authStore.hasAnyRole(roles) ? true : router.parseUrl("/dashboard");
  };
