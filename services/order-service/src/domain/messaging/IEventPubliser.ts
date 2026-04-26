import type { OrderCreated } from "packages/order.events";

export interface IEventPublisher {
  publish(event: OrderCreated): Promise<void>;
}
