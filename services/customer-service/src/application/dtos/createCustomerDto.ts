import zod from "zod";

export const CreateCustomerDTO = zod.object({
  name: zod.string().min(1),
  telephone: zod.string().min(10),
});

export type TypeCreateCustomerDTO = zod.infer<typeof CreateCustomerDTO>;
