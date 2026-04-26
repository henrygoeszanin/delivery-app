import type { PixGenerated } from "packages/order.events";

export interface IEventPublisher {
  publish(event: PixGenerated): Promise<void>;
}
