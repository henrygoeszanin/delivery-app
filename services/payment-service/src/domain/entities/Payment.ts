export type PaymentMethod = "pix" | "credit_card" | "boleto";
export type PaymentStatus = "pending" | "approved" | "failed" | "refunded";

export class Payment {
  constructor(
    public id: string,
    public orderId: string,
    public pixCode: string | null,
    public paymentMethod: PaymentMethod,
    public failureReason: string | null,
    public amount: number,
    public issuedAt: Date,
    public status: PaymentStatus,
    public createdAt: Date,
    public updatedAt: Date,
  ) {}

  static restore(params: {
    id: string;
    orderId: string;
    pixCode: string | null;
    paymentMethod: PaymentMethod;
    failureReason: string | null;
    amount: number;
    issuedAt: Date;
    status: PaymentStatus;
    createdAt: Date;
    updatedAt: Date;
  }): Payment {
    return new Payment(
      params.id,
      params.orderId,
      params.pixCode ?? null,
      params.paymentMethod,
      params.failureReason,
      params.amount,
      params.issuedAt,
      params.status,
      params.createdAt,
      params.updatedAt,
    );
  }

  static create(params: {
    id: string;
    orderId: string;
    pixCode?: string | null;
    paymentMethod: PaymentMethod;
    failureReason?: string | null;
    amount: number;
    issuedAt: Date;
    status: PaymentStatus;
  }): Payment {
    const now = new Date();
    return new Payment(
      params.id,
      params.orderId,
      params.pixCode ?? null,
      params.paymentMethod,
      params.failureReason ?? null,
      params.amount,
      params.issuedAt,
      params.status,
      now,
      now,
    );
  }

  setStatus(status: PaymentStatus) {
    this.status = status;
    this.updatedAt = new Date();
  }

  setIssuedAt(issuedAt: Date) {
    this.issuedAt = issuedAt;
    this.updatedAt = new Date();
  }

  setPixCode(pixCode: string | null) {
    this.pixCode = pixCode;
    this.updatedAt = new Date();
  }

  setPaymentMethod(paymentMethod: PaymentMethod) {
    this.paymentMethod = paymentMethod;
    this.updatedAt = new Date();
  }

  setAmount(amount: number) {
    this.amount = amount;
    this.updatedAt = new Date();
  }

  setFailureReason(failureReason: string | null) {
    this.failureReason = failureReason;
    this.updatedAt = new Date();
  }
}
