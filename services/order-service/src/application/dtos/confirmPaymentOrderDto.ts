import zod from "zod";

export const ConfirmPaymentOrderDTO = zod.object({});

export type TypeConfirmPaymentOrderDTO = zod.infer<
  typeof ConfirmPaymentOrderDTO
>;
