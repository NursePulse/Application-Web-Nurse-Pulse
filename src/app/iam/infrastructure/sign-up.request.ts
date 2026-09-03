import { UserRole } from "../domain/model/user.entity";

export type ClinicalRegistrationRole = Extract<
  UserRole,
  "ROLE_NURSE" | "ROLE_DOCTOR"
>;

export interface SignUpRequest {
  username: string;
  password: string;
  role: ClinicalRegistrationRole;
}
