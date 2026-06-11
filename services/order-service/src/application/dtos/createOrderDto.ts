import zod from "zod";

export const CreateOrderDTO = zod.object({
  customerId: zod.string(),
  items: zod.array(
    zod.object({
      productId: zod.string(),
      quantity: zod.number().int().positive(),
    }),
  ),
});

export type TypeCreateOrderDTO = zod.infer<typeof CreateOrderDTO>;

export const CreateOrderResponseDTO = zod.object({
  id: zod.number(),
  customerId: zod.string(),
  items: zod.array(
    zod.object({
      productId: zod.string(),
      quantity: zod.number().int().positive(),
      unitPrice: zod.number().positive(),
      discount: zod.number().nonnegative().optional(),
    }),
  ),
  totalAmount: zod.number().positive(),
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
  createdAt: zod.date(),
  updatedAt: zod.date(),
  pixCode: zod.string().nullable().optional(),
});

export type TypeCreateOrderResponseDTO = zod.infer<
  typeof CreateOrderResponseDTO
>;
