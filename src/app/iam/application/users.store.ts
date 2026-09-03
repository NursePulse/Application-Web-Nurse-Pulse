import { Injectable, inject, signal } from "@angular/core";
import { HttpErrorResponse } from "@angular/common/http";
import { User, UserRole } from "../domain/model/user.entity";
import { UsersApiEndpoint } from "../infrastructure/users-api-endpoint";
import { UserAssembler } from "../infrastructure/user-assembler";

@Injectable({ providedIn: "root" })
export class UsersStore {
  private readonly api = inject(UsersApiEndpoint);

  readonly users = signal<User[]>([]);
  readonly loading = signal(false);
  readonly errorKey = signal<string | null>(null);
  readonly updatingUserId = signal<string | null>(null);
  readonly updatedUserId = signal<string | null>(null);

  loadUsers(): void {
    this.loading.set(true);
    this.errorKey.set(null);
    this.api.getAll().subscribe({
      next: (responses) => {
        this.users.set(responses.map(UserAssembler.toEntity));
        this.loading.set(false);
      },
      error: () => {
        this.errorKey.set("users.errors.load");
        this.loading.set(false);
      },
    });
  }

  assignRole(userId: string, role: UserRole): void {
    this.updatingUserId.set(userId);
    this.updatedUserId.set(null);
    this.errorKey.set(null);
    this.api.updateRoles(userId, [role]).subscribe({
      next: (response) => {
        const updated = UserAssembler.toEntity(response);
        this.users.update((users) =>
          users.map((user) => (user.id === updated.id ? updated : user)),
        );
        this.updatingUserId.set(null);
        this.updatedUserId.set(userId);
      },
      error: (error: unknown) => {
        this.updatingUserId.set(null);
        this.errorKey.set(this.toErrorKey(error));
      },
    });
  }

  private toErrorKey(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 422) return "users.errors.selfChange";
      if (error.status === 404) return "users.errors.notFound";
      if (error.status === 0) return "users.errors.network";
    }
    return "users.errors.generic";
  }
}
