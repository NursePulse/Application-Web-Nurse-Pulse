export type UserRole = "ROLE_ADMIN" | "ROLE_DOCTOR" | "ROLE_NURSE";

export class User {
  constructor(
    public readonly id: string,
    public readonly username: string,
    public readonly roles: UserRole[],
    public readonly firstName?: string,
    public readonly lastName?: string,
  ) {}

  get displayName(): string {
    if (this.firstName && this.lastName)
      return `${this.firstName} ${this.lastName}`;
    return this.username;
  }

  get primaryRole(): UserRole {
    if (this.roles.includes("ROLE_ADMIN")) return "ROLE_ADMIN";
    if (this.roles.includes("ROLE_DOCTOR")) return "ROLE_DOCTOR";
    return "ROLE_NURSE";
  }

  hasAnyRole(roles: UserRole[]): boolean {
    return roles.some((role) => this.roles.includes(role));
  }
}
