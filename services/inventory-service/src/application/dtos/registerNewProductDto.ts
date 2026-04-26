import zod from "zod";

export const RegisterNewProductDTO = zod.object({
  name: zod.string().min(1, "Name is required"),
  description: zod.string("Description is Optional, it's string").optional(),
  price: zod.number().positive("Price must be a positive number"),
  stock: zod.number().int().nonnegative("Stock must be a non-negative integer"),
  photoUrl: zod.url("Photo URL must be a valid URL").optional(),
});

export type TypeRegisterNewProductDTO = zod.infer<typeof RegisterNewProductDTO>;
