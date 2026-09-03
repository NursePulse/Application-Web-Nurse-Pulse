import { Injectable, computed, signal } from "@angular/core";

export type ViewMode = "admin" | "doctor" | "nurse";

const VIEW_MODE_KEY = "pulse-report-view-mode";

@Injectable({ providedIn: "root" })
export class ViewModeStore {
  private readonly selectedMode = signal<ViewMode>(this.readMode());

  readonly mode = this.selectedMode.asReadonly();
  readonly isAdmin = computed(() => this.selectedMode() === "admin");
  readonly isDoctor = computed(() => this.selectedMode() === "doctor");
  readonly isNurse = computed(() => this.selectedMode() === "nurse");

  setMode(mode: ViewMode): void {
    this.selectedMode.set(mode);
    this.saveMode(mode);
  }

  switchMode(): void {
    const nextMode: Record<ViewMode, ViewMode> = {
      admin: "doctor",
      doctor: "nurse",
      nurse: "admin",
    };
    this.setMode(nextMode[this.selectedMode()]);
  }

  clearMode(): void {
    this.selectedMode.set("nurse");
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(VIEW_MODE_KEY);
    }
  }

  private readMode(): ViewMode {
    if (typeof localStorage === "undefined") {
      return "nurse";
    }

    const storedMode = localStorage.getItem(VIEW_MODE_KEY);
    return storedMode === "admin" ||
      storedMode === "doctor" ||
      storedMode === "nurse"
      ? storedMode
      : "nurse";
  }

  private saveMode(mode: ViewMode): void {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(VIEW_MODE_KEY, mode);
    }
  }
}
