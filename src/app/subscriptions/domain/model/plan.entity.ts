export type PlanId = "essential" | "professional" | "enterprise";

export class Plan {
  constructor(
    public readonly id: PlanId,
    public readonly nameKey: string,
    public readonly descriptionKey: string,
    public readonly monthlyPrice: number,
    public readonly featureKeys: string[],
    public readonly maxSeats: number,
    public readonly highlighted: boolean,
  ) {}
}
