import { Component, inject, OnInit, signal } from "@angular/core";
import { DatePipe } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { SbarStore } from "../../../application/sbar.store";
import { PatientStore } from "@patient/application/patient.store";
import { UsersStore } from "@iam/application/users.store";
import { AuthStore } from "@iam/application/auth.store";
import { TranslatePipe, TranslateService } from "@ngx-translate/core";

@Component({
  selector: "app-sbar-list",
  standalone: true,
  imports: [TranslatePipe, DatePipe, FormsModule],
  templateUrl: "./sbar-list.html",
  styleUrl: "./sbar-list.css",
})
export class SbarListComponent implements OnInit {
  protected store = inject(SbarStore);
  protected patientStore = inject(PatientStore);
  protected usersStore = inject(UsersStore);
  private authStore = inject(AuthStore);
  private translate = inject(TranslateService);

  showForm = signal(false);
  errorMessage = signal<string | null>(null);

  form = this.emptyForm();

  ngOnInit(): void {
    this.patientStore.loadPatients();
    this.usersStore.loadUsers();
    this.store.loadTransfers();
  }

  protected receiverOptions() {
    const currentUserId = this.authStore.user()?.id;
    return this.usersStore
      .users()
      .filter(
        (user) => user.roles.includes("ROLE_NURSE") && user.id !== currentUserId,
      );
  }

  /** Only nurses and admins can create or acknowledge a handover; doctors can only view. */
  protected canManageHandovers(): boolean {
    return this.authStore.hasAnyRole(["ROLE_NURSE", "ROLE_ADMIN"]);
  }

  openForm(): void {
    if (!this.canManageHandovers()) return;
    this.errorMessage.set(null);
    this.form = this.emptyForm();
    this.showForm.set(true);
  }

  cancelForm(): void {
    this.errorMessage.set(null);
    this.showForm.set(false);
  }

  save(): void {
    if (this.store.saving()) return;
    if (!this.canManageHandovers()) {
      this.errorMessage.set("No tienes permiso para registrar traspasos.");
      return;
    }
    this.errorMessage.set(this.validateForm());
    if (this.errorMessage()) return;

    this.store.registerTransfer(
      {
        ...this.form,
        situation: this.form.situation.trim(),
        background: this.form.background.trim(),
        assessment: this.form.assessment.trim(),
        recommendation: this.form.recommendation.trim(),
      },
      () => this.cancelForm(),
    );
  }

  acknowledge(id: string): void {
    if (!this.canManageHandovers()) return;
    this.store.acknowledgeTransfer(id);
  }

  private emptyForm() {
    return {
      patientId: "",
      targetNurseId: "",
      situation: "",
      background: "",
      assessment: "",
      recommendation: "",
    };
  }

  private validateForm(): string | null {
    if (!this.form.patientId)
      return this.translate.instant("sbar.validation.patientRequired");
    if (!this.form.targetNurseId)
      return this.translate.instant("sbar.validation.receiverRequired");
    if (this.form.situation.trim().length < 8)
      return this.translate.instant("sbar.validation.situation");
    if (this.form.situation.trim().length > 1000)
      return this.translate.instant("sbar.validation.situationTooLong");
    if (this.form.background.trim().length < 8)
      return this.translate.instant("sbar.validation.background");
    if (this.form.background.trim().length > 1000)
      return this.translate.instant("sbar.validation.backgroundTooLong");
    if (this.form.assessment.trim().length < 8)
      return this.translate.instant("sbar.validation.assessment");
    if (this.form.assessment.trim().length > 1000)
      return this.translate.instant("sbar.validation.assessmentTooLong");
    if (this.form.recommendation.trim().length < 8)
      return this.translate.instant("sbar.validation.recommendation");
    if (this.form.recommendation.trim().length > 1000)
      return this.translate.instant("sbar.validation.recommendationTooLong");
    return null;
  }
}
