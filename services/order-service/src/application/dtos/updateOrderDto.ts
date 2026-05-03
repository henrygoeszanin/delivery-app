import zod from "zod";
import { Order } from "../../domain/entities/Order";

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

export type UpdateOrderResult =
  | { success: true; order: Order }
  | { success: false; reason: "not_found" | "no_updates" | "without_pix_code" };
