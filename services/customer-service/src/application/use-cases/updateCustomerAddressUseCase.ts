import type { TypeUpdateCustomerAddressDTO } from "../dtos/updateCustomerAddressDto";
import type { ICustomerRepository } from "../../domain/repositories/ICustomerRepository";
import type { Customer } from "../../domain/entities/Customer";

export class UpdateCustomerAddressUseCase {
  constructor(private readonly customerRepository: ICustomerRepository) {}

  async execute(
    id: string,
    dto: TypeUpdateCustomerAddressDTO,
  ): Promise<Customer | null> {
    const customer = await this.customerRepository.findById(id);

    if (!customer) {
      return null;
    }

    customer.setAddress(dto.address);
    await this.customerRepository.update(customer);

    return customer;
  }
}
