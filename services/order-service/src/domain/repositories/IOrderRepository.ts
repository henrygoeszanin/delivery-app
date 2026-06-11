import type { Order } from "../entities/Order";

export interface IOrderRepository {
  save(order: Order): Promise<number>;
  update(order: Order): Promise<void>;
  findById(id: number): Promise<Order | null>;
  findByCustomerId(customerId: string): Promise<Order[]>;
}
