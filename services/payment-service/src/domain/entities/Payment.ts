export type PaymentMethod = "pix" | "credit_card" | "boleto";
export type PaymentStatus = "pending" | "approved" | "failed" | "refunded";

export class Payment {
  constructor(
    public id: string,
    public pixCode: string | null,
    public paymentMethod: PaymentMethod,
    public amount: number,
    public issuedAt: Date,
    public status: PaymentStatus,
    public createdAt: Date,
    public updatedAt: Date,
  ) {}

  static restore(params: {
    id: string;
    pixCode: string | null;
    paymentMethod: PaymentMethod;
    amount: number;
    issuedAt: Date;
    status: PaymentStatus;
    createdAt: Date;
    updatedAt: Date;
  }): Payment {
    return new Payment(
      params.id,
      params.pixCode,
      params.paymentMethod,
      params.amount,
      params.issuedAt,
      params.status,
      params.createdAt,
      params.updatedAt,
    );
  }

  static create(params: {
    id: string;
    pixCode?: string | null;
    paymentMethod: PaymentMethod;
    amount: number;
    issuedAt: Date;
    status: PaymentStatus;
  }): Payment {
    const now = new Date();
    return new Payment(
      params.id,
      params.pixCode ?? null,
      params.paymentMethod,
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
}
