export interface AuthenticatedUserResponse {
  id: number | string;
  username: string;
  roles: string[];
  token: string;
}
