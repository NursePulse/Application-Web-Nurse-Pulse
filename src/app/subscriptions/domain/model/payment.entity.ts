import { PlanId } from "./plan.entity";

export interface PaymentRequest {
  planId: PlanId;
  amount: number;
  currency: "USD";
  billingEmail: string;
  cardholderName: string;
  cardLastFour: string;
}

export interface PaymentReceipt extends PaymentRequest {
  transactionId: string;
  paidAt: Date;
  status: "APPROVED";
}
