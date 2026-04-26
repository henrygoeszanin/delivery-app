import zod from "zod";

export const UpdateOrderStatusDTO = zod.object({
  status: zod.enum([
    "pending",
    "confirmed",
    "shipped",
    "delivered",
    "cancelled",
    "payment_failed",
    "stock_reserved",
    "stock_reservation_failed",
    "payment_processed",
    "awaiting_payment",
    "awaiting_stock",
  ]),
});

export type TypeUpdateOrderStatusDTO = zod.infer<typeof UpdateOrderStatusDTO>;
