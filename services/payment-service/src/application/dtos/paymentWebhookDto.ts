import zod from "zod";

export const PaymentWebhookDTO = zod.object({
  paymentId: zod.uuid(),
  orderId: zod.uuid(),
  pixCode: zod.string().nullable().optional(),
  paymentMethod: zod.enum(["pix", "credit_card", "boleto"]),
  failureReason: zod.string().nullable().optional(),
  amount: zod.number().positive(),
  issuedAt: zod.string().refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "Invalid date format",
  }),
  status: zod.enum(["pending", "approved", "failed", "refunded"]),
});

export type TypePaymentWebhookDTO = zod.infer<typeof PaymentWebhookDTO>;
