export type DomainEvent<T extends string, P> = {
  eventId: string;
  eventType: T;
  occurredAt: Date;
  payload: P;
};

export const EXCHANGE_ORDER_CREATED = "order.created";
export type OrderCreated = DomainEvent<
  "order.created",
  {
    orderId: string;
    customerId: string;
    items: Array<{ productId: string; quantity: number; unitPrice: number }>;
    totalAmount: number;
  }
>;

export const EXCHANGE_GET_ITEMS_DETAILS = "get.items.details";
export type GetItemsDetails = DomainEvent<
  "get.items.details",
  {
    itemIds: Array<string>;
  }
>;
export type ItemDetails = {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
};

export type PixGenerated = DomainEvent<
  "payment.pix_generated",
  {
    orderId: string;
    paymentId: string;
    pixCode: string;
    amount: number;
    dueDate: Date;
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
