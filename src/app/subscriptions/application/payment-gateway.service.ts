import { Injectable } from "@angular/core";
import { map, Observable, timer } from "rxjs";
import { PaymentReceipt, PaymentRequest } from "../domain/model/payment.entity";

@Injectable({ providedIn: "root" })
export class PaymentGatewayService {
  process(request: PaymentRequest): Observable<PaymentReceipt> {
    return timer(1200).pipe(
      map(() => ({
        ...request,
        transactionId: this.createTransactionId(),
        paidAt: new Date(),
        status: "APPROVED" as const,
      })),
    );
  }

  private createTransactionId(): string {
    const randomPart =
      globalThis.crypto?.randomUUID?.().replaceAll("-", "").slice(0, 10) ??
      Math.random().toString(36).slice(2, 12);
    return `PR-${randomPart.toUpperCase()}`;
  }
}
