import { Injectable, inject, signal } from "@angular/core";
import { VitalSign, RiskLevel } from "../domain/model/vital-sign.entity";
import { VitalSignApiEndpoint } from "../infrastructure/vital-sign-api-endpoint";
import { VitalSignAssembler } from "../infrastructure/vital-sign-assembler";
import { PatientStore } from "@patient/application/patient.store";
import { AuditStore } from "@audit/application/audit.store";
import { AuditAction } from "@audit/domain/model/audit-log.entity";
import { NotificationStore } from "@notification/application/notification.store";
import { AlertSeverity } from "@notification/domain/model/alert.entity";

export interface VitalSignForm {
  patientId: string;
  heartRate: number;
  respiratoryRate: number;
  systolic: number;
  diastolic: number;
  oxygenSaturation: number;
  temperature: number;
}

@Injectable({ providedIn: "root" })
export class VitalSignStore {
  private readonly api = inject(VitalSignApiEndpoint);
  private readonly patients = inject(PatientStore);
  private readonly audit = inject(AuditStore);
  private readonly notifications = inject(NotificationStore);

  private readonly _vitalSigns = signal<VitalSign[]>([]);
  readonly vitalSigns = this._vitalSigns.asReadonly();

  loadVitalSigns(): void {
    this.api.getAll().subscribe((res) => {
      const signs = VitalSignAssembler.toEntityList(res, (id) =>
        this.resolvePatientName(id),
      ).sort((a, b) => b.recordedAt.getTime() - a.recordedAt.getTime());

      this._vitalSigns.set(signs);
    });
  }

  loadByPatientId(patientId: string): void {
    this.api.getByPatientId(patientId).subscribe((res) => {
      const signs = VitalSignAssembler.toEntityList(res, (id) =>
        this.resolvePatientName(id),
      ).sort((a, b) => b.recordedAt.getTime() - a.recordedAt.getTime());

      this._vitalSigns.update((current) =>
        [
          ...signs,
          ...current.filter((item) => item.patientId !== patientId),
        ].sort((a, b) => b.recordedAt.getTime() - a.recordedAt.getTime()),
      );
    });
  }

  recordVitalSign(form: VitalSignForm): void {
    const request = {
      patientId: Number(form.patientId),
      nurseId: 1,
      heartRate: Number(form.heartRate),
      respiratoryRate: Number(form.respiratoryRate),
      systolicPressure: Number(form.systolic),
      diastolicPressure: Number(form.diastolic),
      oxygenSaturation: Number(form.oxygenSaturation),
      temperature: Number(form.temperature),
      recordedAt: new Date().toISOString().slice(0, 19),
    };

    this.api.record(request).subscribe((created) => {
      const sign = VitalSignAssembler.toEntity(
        created,
        this.resolvePatientName(String(created.patientId)),
      );

      this._vitalSigns.update((list) => [sign, ...list]);
      this.audit.register(
        AuditAction.VITAL_SIGN_RECORDED,
        `Registró signos vitales de ${sign.patientName} con riesgo ${sign.riskLabel}`,
      );
      this.audit.register(
        AuditAction.BUSINESS_TRANSACTION_EXECUTED,
        `Transacción: signos vitales → evaluación de riesgo → alertas → auditoría para ${sign.patientName}`,
      );

      this.createAlertsWhenNeeded(sign);
    });
  }

  private createAlertsWhenNeeded(sign: VitalSign): void {
    if (
      sign.riskLevel !== RiskLevel.CRITICAL &&
      sign.riskLevel !== RiskLevel.HIGH
    )
      return;

    const severity =
      sign.riskLevel === RiskLevel.CRITICAL
        ? AlertSeverity.CRITICAL
        : AlertSeverity.HIGH;
    const messages = this.getClinicalFindings(sign);

    this.notifications.createClinicalAlert({
      patientId: sign.patientId,
      patientName: sign.patientName,
      title:
        sign.riskLevel === RiskLevel.CRITICAL
          ? "Signos vitales críticos"
          : "Signos vitales fuera de rango",
      message: messages.join(" | "),
      severity,
      sourceType: "VITAL_SIGN",
      sourceId: sign.id,
    });
  }

  private getClinicalFindings(sign: VitalSign): string[] {
    const findings: string[] = [];

    if (sign.oxygenSaturation < 90)
      findings.push(`SatO₂ crítica: ${sign.oxygenSaturation}%`);
    else if (sign.oxygenSaturation < 94)
      findings.push(`SatO₂ baja: ${sign.oxygenSaturation}%`);

    if (sign.systolic >= 160 || sign.diastolic >= 100)
      findings.push(
        `Presión arterial crítica: ${sign.systolic}/${sign.diastolic} mmHg`,
      );
    else if (sign.systolic >= 145 || sign.diastolic >= 95)
      findings.push(
        `Presión arterial elevada: ${sign.systolic}/${sign.diastolic} mmHg`,
      );

    if (sign.heartRate >= 130)
      findings.push(`Frecuencia cardiaca crítica: ${sign.heartRate} bpm`);
    else if (sign.heartRate >= 110)
      findings.push(`Frecuencia cardiaca alta: ${sign.heartRate} bpm`);

    if (sign.respiratoryRate >= 24)
      findings.push(
        `Frecuencia respiratoria alta: ${sign.respiratoryRate} rpm`,
      );
    if (sign.temperature >= 39)
      findings.push(`Fiebre crítica: ${sign.temperature} °C`);
    else if (sign.temperature >= 38)
      findings.push(`Fiebre: ${sign.temperature} °C`);

    return findings.length
      ? findings
      : [`Riesgo ${sign.riskLabel} detectado en monitoreo clínico.`];
  }

  private resolvePatientName(patientId: string): string {
    return (
      this.patients.patients().find((patient) => patient.id === patientId)
        ?.fullName ?? `Paciente #${patientId}`
    );
  }
}
