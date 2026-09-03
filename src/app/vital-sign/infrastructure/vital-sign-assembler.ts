import { VitalSign, RiskLevel } from "../domain/model/vital-sign.entity";
import { VitalSignResponse } from "./vital-sign-response";

export class VitalSignAssembler {
  static toEntity(
    response: VitalSignResponse,
    patientName?: string,
  ): VitalSign {
    const calculatedRisk = this.resolveRiskLevel(response);

    return new VitalSign(
      String(response.id),
      String(response.patientId),
      patientName ?? `Paciente #${response.patientId}`,
      String(response.nurseId),
      response.heartRate,
      response.respiratoryRate,
      response.systolic,
      response.diastolic,
      response.oxygenSaturation,
      Number(response.temperature),
      calculatedRisk,
      new Date(response.recordedAt),
    );
  }

  static toEntityList(
    responses: VitalSignResponse[],
    resolvePatientName?: (patientId: string) => string,
  ): VitalSign[] {
    return responses.map((response) =>
      this.toEntity(response, resolvePatientName?.(String(response.patientId))),
    );
  }

  private static resolveRiskLevel(response: VitalSignResponse): RiskLevel {
    const backendRisk = response.riskLevel as RiskLevel;

    if (backendRisk && backendRisk !== RiskLevel.UNASSESSED) {
      return backendRisk;
    }

    return this.calculateRiskLevel(response);
  }

  private static calculateRiskLevel(response: VitalSignResponse): RiskLevel {
    const heartRate = response.heartRate;
    const respiratoryRate = response.respiratoryRate;
    const systolic = response.systolic;
    const diastolic = response.diastolic;
    const oxygenSaturation = response.oxygenSaturation;
    const temperature = Number(response.temperature);

    const isCritical =
      oxygenSaturation < 90 ||
      heartRate >= 130 ||
      heartRate < 40 ||
      respiratoryRate >= 30 ||
      respiratoryRate < 8 ||
      systolic >= 180 ||
      systolic < 80 ||
      diastolic >= 120 ||
      temperature >= 39.5 ||
      temperature < 35;

    if (isCritical) return RiskLevel.CRITICAL;

    const isHigh =
      oxygenSaturation < 94 ||
      heartRate >= 110 ||
      heartRate < 50 ||
      respiratoryRate >= 24 ||
      systolic >= 160 ||
      systolic < 90 ||
      diastolic >= 100 ||
      temperature >= 38;

    if (isHigh) return RiskLevel.HIGH;

    const isMedium =
      heartRate >= 100 ||
      respiratoryRate >= 20 ||
      systolic >= 140 ||
      diastolic >= 90 ||
      oxygenSaturation < 96 ||
      temperature >= 37.5;

    if (isMedium) return RiskLevel.MEDIUM;

    return RiskLevel.LOW;
  }
}
