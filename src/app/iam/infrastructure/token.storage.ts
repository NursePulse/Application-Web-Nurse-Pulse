import { Injectable } from "@angular/core";
import { UserRole } from "../domain/model/user.entity";

const TOKEN_KEY = "pulse-report-token";
const USER_KEY = "pulse-report-user";

export interface StoredUser {
  id: string;
  username: string;
  roles: UserRole[];
}

@Injectable({ providedIn: "root" })
export class TokenStorage {
  getToken(): string | null {
    if (typeof localStorage === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  }

  getUser(): StoredUser | null {
    if (typeof localStorage === "undefined") return null;
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as StoredUser;
    } catch {
      return null;
    }
  }

  saveSession(token: string, user: StoredUser): void {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  clear(): void {
    if (typeof localStorage === "undefined") return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}
