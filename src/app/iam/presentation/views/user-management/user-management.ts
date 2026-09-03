import { Component, OnInit, inject } from "@angular/core";
import { TranslatePipe } from "@ngx-translate/core";
import { AuthStore } from "../../../application/auth.store";
import { UsersStore } from "../../../application/users.store";
import { User, UserRole } from "../../../domain/model/user.entity";

@Component({
  selector: "app-user-management",
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: "./user-management.html",
  styleUrl: "./user-management.css",
})
export class UserManagementComponent implements OnInit {
  protected readonly usersStore = inject(UsersStore);
  protected readonly authStore = inject(AuthStore);

  protected readonly assignableRoles: UserRole[] = [
    "ROLE_NURSE",
    "ROLE_DOCTOR",
    "ROLE_ADMIN",
  ];

  private readonly pendingSelection = new Map<string, UserRole>();

  ngOnInit(): void {
    this.usersStore.loadUsers();
  }

  protected isCurrentUser(user: User): boolean {
    return this.authStore.user()?.id === user.id;
  }

  protected roleLabelKey(role: string): string {
    switch (role) {
      case "ROLE_ADMIN":
        return "access.adminTitle";
      case "ROLE_DOCTOR":
        return "access.doctorTitle";
      default:
        return "access.nurseTitle";
    }
  }

  protected selectedRole(user: User): UserRole {
    return this.pendingSelection.get(user.id) ?? user.primaryRole;
  }

  protected onRoleSelected(user: User, value: string): void {
    this.pendingSelection.set(user.id, value as UserRole);
  }

  protected hasPendingChange(user: User): boolean {
    return this.selectedRole(user) !== user.primaryRole;
  }

  protected applyRole(user: User): void {
    const role = this.selectedRole(user);
    if (role === user.primaryRole) return;
    this.usersStore.assignRole(user.id, role);
    this.pendingSelection.delete(user.id);
  }

  protected initialsOf(user: User): string {
    return user.username.slice(0, 2).toUpperCase();
  }
}
