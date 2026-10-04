import { SubscriptionStore } from "./subscription.store";

/** US-39: the administrator reviews the plans and selects one (kept in the browser, no real charge). */
describe("SubscriptionStore", () => {
  const key = "nurse-pulse-subscription-plan";

  beforeEach(() => localStorage.clear());

  it("offers the three plans and defaults to the essential one", () => {
    const store = new SubscriptionStore();

    expect(store.plans().map((plan) => plan.id)).toEqual([
      "essential",
      "professional",
      "enterprise",
    ]);
    expect(store.currentPlanId()).toBe("essential");
    expect(store.currentPlan().id).toBe("essential");
  });

  it("stores the selected plan in the browser", () => {
    const store = new SubscriptionStore();

    store.selectPlan("professional");

    expect(store.currentPlan().id).toBe("professional");
    expect(localStorage.getItem(key)).toBe("professional");
  });

  it("restores the plan chosen earlier", () => {
    localStorage.setItem(key, "enterprise");

    expect(new SubscriptionStore().currentPlanId()).toBe("enterprise");
  });

  it("ignores an unknown stored value", () => {
    localStorage.setItem(key, "platinum");

    expect(new SubscriptionStore().currentPlanId()).toBe("essential");
  });
});
