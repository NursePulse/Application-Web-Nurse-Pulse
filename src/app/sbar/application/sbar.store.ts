import { Injectable, inject, signal } from "@angular/core";
import { forkJoin, map, of, switchMap } from "rxjs";
import { SbarTransfer } from "../domain/model/sbar-transfer.entity";
import { SbarApiEndpoint } from "../infrastructure/sbar-api-endpoint";
import { SbarAssembler } from "../infrastructure/sbar-assembler";
import { PatientStore } from "@patient/application/patient.store";
import { PatientApiEndpoint } from "@patient/infrastructure/patient-api-endpoint";
import { PatientAssembler } from "@patient/infrastructure/patient-assembler";
import { AuditStore } from "@audit/application/audit.store";
import { AuditAction } from "@audit/domain/model/audit-log.entity";

const DEFAULT_ACTOR = "Equipo clínico";

export interface SbarForm {
  patientId: string;
  targetNurseId: string;
  situation: string;
  background: string;
  assessment: string;
  recommendation: string;
}

@Injectable({ providedIn: "root" })
export class SbarStore {
  private readonly api = inject(SbarApiEndpoint);
  private readonly patientApi = inject(PatientApiEndpoint);
  private readonly patients = inject(PatientStore);
  private readonly audit = inject(AuditStore);

  private readonly _transfers = signal<SbarTransfer[]>([]);
  readonly transfers = this._transfers.asReadonly();

  loadTransfers(): void {
    this.patientApi
      .getAll()
      .pipe(
        switchMap((patientResponses) => {
          const patients = PatientAssembler.toEntityList(patientResponses);

          if (!patients.length) return of([]);

          return forkJoin(
            patients.map((patient) =>
              this.api
                .getByPatientId(patient.id)
                .pipe(
                  map((handovers) =>
                    SbarAssembler.toEntityList(
                      handovers,
                      (id) =>
                        patients.find((p) => p.id === id)?.fullName ??
                        `Paciente #${id}`,
                    ),
                  ),
                ),
            ),
          ).pipe(map((groups) => groups.flat()));
        }),
      )
      .subscribe((transfers) => {
        this._transfers.set(
          transfers.sort(
            (a, b) => b.transferredAt.getTime() - a.transferredAt.getTime(),
          ),
        );
      });
  }

  registerTransfer(form: SbarForm): void {
    const patient = this.patients
      .patients()
      .find((p) => p.id === form.patientId);
    const receiverName = this.resolveReceiverName(form.targetNurseId);

    const request = {
      patientId: Number(form.patientId),
      title: `SBAR - ${patient?.fullName ?? "Paciente"}`,
      description: SbarAssembler.buildDescription(
        form.targetNurseId,
        receiverName,
        form.situation,
        form.background,
        form.assessment,
        form.recommendation,
      ),
    };

    this.api
      .register(request)
      .pipe(
        switchMap((created) => {
          if (typeof created === "number" || typeof created === "string") {
            return this.api.getById(String(created));
          }

          return of(created);
        }),
      )
      .subscribe((created) => {
        const transfer = SbarAssembler.toEntity(created, patient?.fullName);
        this._transfers.update((list) => [transfer, ...list]);
        this.audit.register(
          AuditAction.SBAR_TRANSFER,
          `Registró traspaso SBAR para ${transfer.patientName} enviado a ${receiverName} por ${DEFAULT_ACTOR}`,
        );
      });
  }

  acknowledgeTransfer(
    transferId: string,
    incomingNurseId: string,
    notes = "Traspaso SBAR revisado y atendido.",
  ): void {
    this.api
      .acknowledge(transferId, {
        incomingNurseId: Number(incomingNurseId),
        additionalNotes: notes,
      })
      .subscribe((updated) => {
        const transfer = SbarAssembler.toEntity(
          updated,
          this.resolvePatientName(String(updated.patientId)),
        );
        this._transfers.update((list) =>
          list.map((item) => (item.id === transfer.id ? transfer : item)),
        );
        this.audit.register(
          AuditAction.SBAR_TRANSFER,
          `Atendió traspaso SBAR para ${transfer.patientName}`,
        );
      });
  }

  private resolvePatientName(patientId: string): string {
    return (
      this.patients.patients().find((patient) => patient.id === patientId)
        ?.fullName ?? `Paciente #${patientId}`
    );
  }

  private resolveReceiverName(id: string): string {
    const names: Record<string, string> = {
      "2": "Enfermero Luis",
      "3": "Enfermera Laura",
      "4": "Enfermera Claudia",
    };

    return names[id] ?? `Enfermero #${id}`;
  }
}
