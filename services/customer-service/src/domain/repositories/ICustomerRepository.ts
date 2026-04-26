import type { Customer } from "../entities/Customer";

export interface ICustomerRepository {
  save(customer: Customer): Promise<void>;
  update(customer: Customer): Promise<void>;
  findById(id: string): Promise<Customer | null>;
  findByTelephone(telephone: string): Promise<Customer | null>;
}
