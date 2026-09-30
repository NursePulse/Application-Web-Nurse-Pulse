export interface UserResponse {
  id: number | string;
  username: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
}
