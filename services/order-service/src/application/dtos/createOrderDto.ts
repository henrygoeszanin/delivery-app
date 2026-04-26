import zod from "zod";

export const CreateOrderDTO = zod.object({
  customerId: zod.string(),
  items: zod.array(
    zod.object({
      productId: zod.string(),
      quantity: zod.number().int().positive(),
      unitPrice: zod.number().positive(),
    }),
  ),
});

export type TypeCreateOrderDTO = zod.infer<typeof CreateOrderDTO>;
