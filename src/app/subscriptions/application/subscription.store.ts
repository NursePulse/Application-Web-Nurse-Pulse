import { Injectable, computed, signal } from "@angular/core";
import { Plan, PlanId } from "../domain/model/plan.entity";

const SUBSCRIPTION_KEY = "pulse-report-subscription-plan";

const PLAN_CATALOG: Plan[] = [
  new Plan(
    "essential",
    "subscriptions.essential.name",
    "subscriptions.essential.description",
    0,
    [
      "subscriptions.features.patients",
      "subscriptions.features.vitalSigns",
      "subscriptions.features.alerts",
    ],
    5,
    false,
  ),
  new Plan(
    "professional",
    "subscriptions.professional.name",
    "subscriptions.professional.description",
    49,
    [
      "subscriptions.features.patients",
      "subscriptions.features.vitalSigns",
      "subscriptions.features.alerts",
      "subscriptions.features.sbar",
      "subscriptions.features.reports",
    ],
    25,
    true,
  ),
  new Plan(
    "enterprise",
    "subscriptions.enterprise.name",
    "subscriptions.enterprise.description",
    129,
    [
      "subscriptions.features.patients",
      "subscriptions.features.vitalSigns",
      "subscriptions.features.alerts",
      "subscriptions.features.sbar",
      "subscriptions.features.reports",
      "subscriptions.features.audit",
      "subscriptions.features.prioritySupport",
    ],
    100,
    false,
  ),
];

@Injectable({ providedIn: "root" })
export class SubscriptionStore {
  private readonly selectedPlanId = signal<PlanId>(this.readPlan());

  readonly plans = signal<Plan[]>(PLAN_CATALOG).asReadonly();
  readonly currentPlanId = this.selectedPlanId.asReadonly();
  readonly currentPlan = computed(
    () =>
      PLAN_CATALOG.find((plan) => plan.id === this.selectedPlanId()) ??
      PLAN_CATALOG[0],
  );

  selectPlan(planId: PlanId): void {
    this.selectedPlanId.set(planId);
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(SUBSCRIPTION_KEY, planId);
    }
  }

  private readPlan(): PlanId {
    if (typeof localStorage === "undefined") return "essential";
    const stored = localStorage.getItem(SUBSCRIPTION_KEY);
    return stored === "professional" || stored === "enterprise"
      ? stored
      : "essential";
  }
}
