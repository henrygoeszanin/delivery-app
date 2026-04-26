export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "payment_failed"
  | "stock_reserved"
  | "stock_reservation_failed"
  | "payment_processed"
  | "awaiting_payment"
  | "awaiting_stock";

export class Order {
  constructor(
    public id: string,
    public customerId: string,
    public items: Array<{
      productId: string;
      quantity: number;
      unitPrice: number;
      discount?: number;
    }>,
    public totalAmount: number,
    public status: OrderStatus,
    public createdAt: Date,
    public updatedAt: Date,
    public pixCode?: string | null,
    public paymentId?: string | null,
  ) {}

  static restore(params: {
    id: string;
    customerId: string;
    items: Array<{
      productId: string;
      quantity: number;
      unitPrice: number;
      discount?: number;
    }>;
    totalAmount: number;
    status:
      | "pending"
      | "confirmed"
      | "shipped"
      | "delivered"
      | "cancelled"
      | "payment_failed"
      | "stock_reserved"
      | "stock_reservation_failed"
      | "payment_processed"
      | "awaiting_payment"
      | "awaiting_stock";
    createdAt: Date;
    updatedAt: Date;
  }): Order {
    return new Order(
      params.id,
      params.customerId,
      params.items,
      params.totalAmount,
      params.status,
      params.createdAt,
      params.updatedAt,
    );
  }

  static create(
    customerId: string,
    items: Array<{
      productId: string;
      quantity: number;
      unitPrice: number;
      discount?: number;
    }>,
  ): Order {
    const totalAmount = items.reduce((total, item) => {
      const itemTotal =
        item.quantity * item.unitPrice * (1 - (item.discount ?? 0));
      return total + itemTotal;
    }, 0);

    const now = new Date();
    const id = crypto.randomUUID();
    return new Order(id, customerId, items, totalAmount, "pending", now, now);
  }

  updateDetails(params: {
    customerId?: string;
    items?: Array<{
      productId: string;
      quantity: number;
      unitPrice: number;
      discount?: number;
    }>;
  }) {
    if (params.customerId) {
      this.customerId = params.customerId;
    }

    if (params.items) {
      this.items = params.items;
      this.totalAmount = this.total;
    }

    this.updatedAt = new Date();
  }

  cancel() {
    if (this.status === "cancelled") {
      return;
    }

    this.status = "cancelled";
    this.updatedAt = new Date();
  }

  confirmPayment() {
    this.status = "payment_processed";
    this.updatedAt = new Date();
  }

  setStatus(
    status:
      | "pending"
      | "confirmed"
      | "shipped"
      | "delivered"
      | "cancelled"
      | "payment_failed"
      | "stock_reserved"
      | "stock_reservation_failed"
      | "payment_processed"
      | "awaiting_payment"
      | "awaiting_stock",
  ) {
    this.status = status;
    this.updatedAt = new Date();
  }

  get total(): number {
    return this.items.reduce((total, item) => {
      const itemTotal =
        item.quantity * item.unitPrice * (1 - (item.discount ?? 0));
      return total + itemTotal;
    }, 0);
  }

  attachPixCode(pixCode: string, paymentId: string) {
    if (this.status !== "pending") {
      throw new Error(
        `Cannot attach Pix code to order with status ${this.status}`,
      );
    }
    this.status = "awaiting_payment";
    this.pixCode = pixCode;
    this.paymentId = paymentId;
    this.updatedAt = new Date();
  }
}
