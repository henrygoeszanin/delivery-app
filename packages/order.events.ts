export type DomainEvent<T extends string, P> = {
  eventId: string;
  eventType: T;
  occurredAt: Date;
  payload: P;
};

export type OrderCreated = DomainEvent<
  "order.created",
  {
    orderId: string;
    customerId: string;
    items: Array<{ productId: string; quantity: number; unitPrice: number }>;
    totalAmount: number;
  }
>;

export type PixGenerated = DomainEvent<
  "payment.pix_generated",
  {
    orderId: string;
    paymentId: string;
    pixCode: string;
    amount: number;
  }
>;

export type StockReserved = DomainEvent<
  "inventory.stock_reserved",
  {
    orderId: string;
    reservationId: string;
  }
>;

export type PaymentFailed = DomainEvent<
  "payment.failed",
  {
    orderId: string;
    reason: string;
  }
>;
