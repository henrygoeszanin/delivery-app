import zod from "zod";

export const CancelOrderDTO = zod.object({});

export type TypeCancelOrderDTO = zod.infer<typeof CancelOrderDTO>;
