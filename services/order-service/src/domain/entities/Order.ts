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
    public status:
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
    public createdAt: Date,
    public updatedAt: Date,
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

  get total(): number {
    return this.items.reduce((total, item) => {
      const itemTotal =
        item.quantity * item.unitPrice * (1 - (item.discount ?? 0));
      return total + itemTotal;
    }, 0);
  }
}
