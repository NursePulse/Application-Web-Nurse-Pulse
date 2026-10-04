import { RiskLevel } from "../domain/model/vital-sign.entity";
import { VitalSignAssembler } from "./vital-sign-assembler";
import { VitalSignResponse } from "./vital-sign-response";

/** US-22 (identify critical changes) and US-31 (risk thresholds that drive alerts). */
describe("VitalSignAssembler risk classification", () => {
  const normal: VitalSignResponse = {
    id: 1,
    patientId: 5,
    nurseId: 1,
    heartRate: 75,
    respiratoryRate: 16,
    systolic: 120,
    diastolic: 80,
    oxygenSaturation: 98,
    temperature: 36.7,
    riskLevel: "UNASSESSED",
    recordedAt: "2026-01-01T10:00:00",
  };

  const risk = (override: Partial<VitalSignResponse>) =>
    VitalSignAssembler.toEntity({ ...normal, ...override }).riskLevel;

  it("classifies values inside the normal range as LOW", () => {
    expect(risk({})).toBe(RiskLevel.LOW);
  });

  it("classifies mildly abnormal values as MEDIUM", () => {
    expect(risk({ heartRate: 102 })).toBe(RiskLevel.MEDIUM);
    expect(risk({ oxygenSaturation: 95 })).toBe(RiskLevel.MEDIUM);
  });

  it("classifies clearly abnormal values as HIGH", () => {
    expect(risk({ heartRate: 115 })).toBe(RiskLevel.HIGH);
    expect(risk({ oxygenSaturation: 92 })).toBe(RiskLevel.HIGH);
    expect(risk({ temperature: 38.2 })).toBe(RiskLevel.HIGH);
  });

  it("classifies life-threatening values as CRITICAL", () => {
    expect(risk({ heartRate: 180, oxygenSaturation: 82 })).toBe(
      RiskLevel.CRITICAL,
    );
    expect(risk({ systolic: 185 })).toBe(RiskLevel.CRITICAL);
    expect(risk({ heartRate: 35 })).toBe(RiskLevel.CRITICAL);
  });

  it("keeps the risk assessed by the backend when it is not UNASSESSED", () => {
    expect(risk({ riskLevel: "MEDIUM", heartRate: 180 })).toBe(
      RiskLevel.MEDIUM,
    );
  });

  it("falls back to a generic patient name and parses the numeric fields", () => {
    const sign = VitalSignAssembler.toEntity({
      ...normal,
      temperature: "36.7" as unknown as number,
    });

    expect(sign.patientName).toBe("Paciente #5");
    expect(sign.temperature).toBe(36.7);
    expect(sign.bloodPressureFormatted).toBe("TA 120/80");
  });

  it("exposes critical and high-risk flags and Spanish labels", () => {
    const critical = VitalSignAssembler.toEntity({
      ...normal,
      oxygenSaturation: 80,
    });
    const low = VitalSignAssembler.toEntity(normal);

    expect(critical.isCritical).toBe(true);
    expect(critical.isHighRisk).toBe(true);
    expect(critical.riskLabel).toBe("Crítico");
    expect(low.isHighRisk).toBe(false);
    expect(low.riskLabel).toBe("Bajo");
  });
});
