import { HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { catchError, throwError } from "rxjs";
import { AuthStore } from "../application/auth.store";

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  const isAuthenticationCall = request.url.includes("/authentication/");
  const token = authStore.token();

  const outgoing =
    token && !isAuthenticationCall
      ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : request;

  return next(outgoing).pipe(
    catchError((error: unknown) => {
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        !isAuthenticationCall &&
        authStore.isAuthenticated()
      ) {
        authStore.signOut();
        router.navigate(["/sign-in"]);
      }
      return throwError(() => error);
    }),
  );
};
