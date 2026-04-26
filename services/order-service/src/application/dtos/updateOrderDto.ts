import zod from "zod";

export const UpdateOrderDTO = zod.object({
  customerId: zod.string().optional(),
  items: zod
    .array(
      zod.object({
        productId: zod.string(),
        quantity: zod.number().int().positive(),
        unitPrice: zod.number().positive(),
        discount: zod.number().min(0).max(1).optional(),
      }),
    )
    .optional(),
});

export type TypeUpdateOrderDTO = zod.infer<typeof UpdateOrderDTO>;
