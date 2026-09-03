import { CurrencyPipe, DatePipe } from "@angular/common";
import {
  Component,
  computed,
  DestroyRef,
  HostListener,
  inject,
  input,
  output,
  signal,
} from "@angular/core";
import {
  AbstractControl,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
  FormBuilder,
} from "@angular/forms";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { TranslatePipe } from "@ngx-translate/core";
import { finalize } from "rxjs";
import { PaymentGatewayService } from "../../../application/payment-gateway.service";
import { PaymentReceipt } from "../../../domain/model/payment.entity";
import { Plan } from "../../../domain/model/plan.entity";
import {
  BillingDocumentType,
  detectCardBrand,
  formatCardNumber,
  formatExpiry,
  isValidBillingDocument,
  isValidCardNumber,
  isValidFutureExpiry,
  isValidSecurityCode,
  onlyDigits,
} from "../../../domain/services/payment-validation";

function cardNumberValidator(
  control: AbstractControl<string>,
): ValidationErrors | null {
  return isValidCardNumber(control.value) ? null : { cardNumber: true };
}

function expiryValidator(
  control: AbstractControl<string>,
): ValidationErrors | null {
  return isValidFutureExpiry(control.value) ? null : { expiry: true };
}

function securityCodeValidator(
  control: AbstractControl<string>,
): ValidationErrors | null {
  return isValidSecurityCode(control.value) ? null : { securityCode: true };
}

@Component({
  selector: "app-payment-checkout",
  standalone: true,
  imports: [CurrencyPipe, DatePipe, ReactiveFormsModule, TranslatePipe],
  templateUrl: "./payment-checkout.html",
  styleUrl: "./payment-checkout.css",
})
export class PaymentCheckoutComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly gateway = inject(PaymentGatewayService);
  private readonly destroyRef = inject(DestroyRef);

  readonly plan = input.required<Plan>();
  readonly closed = output<void>();
  readonly completed = output<PaymentReceipt>();

  protected readonly submitted = signal(false);
  protected readonly processing = signal(false);
  protected readonly receipt = signal<PaymentReceipt | null>(null);
  protected readonly paymentError = signal(false);
  protected readonly cardBrand = signal(detectCardBrand(""));
  protected readonly documentType = signal<BillingDocumentType>("DNI");
  protected readonly maskedCard = computed(() => {
    const lastFour = this.receipt()?.cardLastFour;
    return lastFour ? `•••• ${lastFour}` : "";
  });

  protected readonly checkoutForm = this.formBuilder.nonNullable.group({
    cardholderName: [
      "",
      [Validators.required, Validators.minLength(3), Validators.maxLength(80)],
    ],
    billingEmail: [
      "",
      [Validators.required, Validators.email, Validators.maxLength(120)],
    ],
    documentType: ["DNI" as BillingDocumentType, Validators.required],
    documentNumber: ["", [Validators.required, Validators.pattern(/^\d+$/)]],
    cardNumber: ["", [Validators.required, cardNumberValidator]],
    expiry: ["", [Validators.required, expiryValidator]],
    securityCode: ["", [Validators.required, securityCodeValidator]],
  });

  protected submitPayment(): void {
    this.submitted.set(true);
    this.paymentError.set(false);
    this.checkoutForm.markAllAsTouched();

    if (
      this.checkoutForm.invalid ||
      !isValidBillingDocument(
        this.checkoutForm.controls.documentType.value,
        this.checkoutForm.controls.documentNumber.value,
      )
    ) {
      return;
    }

    const form = this.checkoutForm.getRawValue();
    const digits = onlyDigits(form.cardNumber);
    this.processing.set(true);

    this.gateway
      .process({
        planId: this.plan().id,
        amount: this.plan().monthlyPrice,
        currency: "USD",
        billingEmail: form.billingEmail.trim(),
        cardholderName: form.cardholderName.trim(),
        cardLastFour: digits.slice(-4),
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.processing.set(false)),
      )
      .subscribe({
        next: (receipt) => {
          this.receipt.set(receipt);
          this.completed.emit(receipt);
          this.checkoutForm.reset({
            documentType: "DNI",
          });
        },
        error: () => this.paymentError.set(true),
      });
  }

  protected updateCardNumber(value: string): void {
    const formatted = formatCardNumber(value);
    this.checkoutForm.controls.cardNumber.setValue(formatted);
    this.cardBrand.set(detectCardBrand(formatted));
  }

  protected updateExpiry(value: string): void {
    this.checkoutForm.controls.expiry.setValue(formatExpiry(value));
  }

  protected updateSecurityCode(value: string): void {
    this.checkoutForm.controls.securityCode.setValue(
      onlyDigits(value).slice(0, 4),
    );
  }

  protected updateDocumentType(value: BillingDocumentType): void {
    this.documentType.set(value);
    this.checkoutForm.controls.documentType.setValue(value);
    this.checkoutForm.controls.documentNumber.setValue("");
  }

  protected updateDocumentNumber(value: string): void {
    const maxLength = this.documentType() === "DNI" ? 8 : 11;
    this.checkoutForm.controls.documentNumber.setValue(
      onlyDigits(value).slice(0, maxLength),
    );
  }

  protected fieldInvalid(
    field:
      | "cardholderName"
      | "billingEmail"
      | "documentNumber"
      | "cardNumber"
      | "expiry"
      | "securityCode",
  ): boolean {
    const control = this.checkoutForm.controls[field];
    if (field === "documentNumber") {
      return (
        (this.submitted() || control.touched) &&
        !isValidBillingDocument(
          this.checkoutForm.controls.documentType.value,
          control.value,
        )
      );
    }
    return control.invalid && (this.submitted() || control.touched);
  }

  protected requestClose(): void {
    if (!this.processing()) this.closed.emit();
  }

  @HostListener("document:keydown.escape")
  protected closeOnEscape(): void {
    this.requestClose();
  }
}
