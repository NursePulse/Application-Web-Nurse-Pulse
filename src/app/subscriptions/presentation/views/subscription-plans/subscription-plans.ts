import { Component, inject, signal } from "@angular/core";
import { TranslatePipe } from "@ngx-translate/core";
import { SubscriptionStore } from "../../../application/subscription.store";
import { PaymentReceipt } from "../../../domain/model/payment.entity";
import { Plan } from "../../../domain/model/plan.entity";
import { PaymentCheckoutComponent } from "../../components/payment-checkout/payment-checkout";

@Component({
  selector: "app-subscription-plans",
  standalone: true,
  imports: [PaymentCheckoutComponent, TranslatePipe],
  templateUrl: "./subscription-plans.html",
  styleUrl: "./subscription-plans.css",
})
export class SubscriptionPlansComponent {
  protected readonly subscriptionStore = inject(SubscriptionStore);
  protected readonly selectedPlan = signal<Plan | null>(null);
  protected readonly activatedPlan = signal<Plan | null>(null);

  protected choosePlan(plan: Plan): void {
    this.activatedPlan.set(null);

    if (plan.monthlyPrice === 0) {
      this.subscriptionStore.selectPlan(plan.id);
      this.activatedPlan.set(plan);
      return;
    }

    this.selectedPlan.set(plan);
  }

  protected closeCheckout(): void {
    this.selectedPlan.set(null);
  }

  protected completePayment(receipt: PaymentReceipt): void {
    this.subscriptionStore.selectPlan(receipt.planId);
    this.activatedPlan.set(this.selectedPlan());
  }
}
