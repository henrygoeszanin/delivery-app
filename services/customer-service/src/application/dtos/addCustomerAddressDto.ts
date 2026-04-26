import zod from "zod";

export const AddCustomerAddressDTO = zod.object({
  address: zod.string().min(1),
});

export type TypeAddCustomerAddressDTO = zod.infer<typeof AddCustomerAddressDTO>;
