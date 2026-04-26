import zod from "zod";

export const UpdateCustomerAddressDTO = zod.object({
  address: zod.string().min(1),
});

export type TypeUpdateCustomerAddressDTO = zod.infer<
  typeof UpdateCustomerAddressDTO
>;
