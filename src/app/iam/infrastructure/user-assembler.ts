import { User, UserRole } from "../domain/model/user.entity";
import { AuthenticatedUserResponse } from "./authenticated-user-response";
import { UserResponse } from "./user-response";

const KNOWN_ROLES: UserRole[] = ["ROLE_ADMIN", "ROLE_DOCTOR", "ROLE_NURSE"];

export class UserAssembler {
  static toEntity(response: AuthenticatedUserResponse | UserResponse): User {
    const roles = (response.roles ?? []).filter((role): role is UserRole =>
      KNOWN_ROLES.includes(role as UserRole),
    );
    return new User(
      String(response.id),
      response.username,
      roles.length > 0 ? roles : ["ROLE_NURSE"],
    );
  }
}
