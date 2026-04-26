import type { Channel } from "amqplib";
import type { IEventPublisher } from "../../domain/messaging/IEventPubliser";
import type { OrderCreated } from "packages/order.events";

export class RabbitMQPublisher implements IEventPublisher {
  constructor(private readonly channel: Channel) {}

  async publish(event: OrderCreated): Promise<void> {
    const message = {
      ...event,
      occurredAt: event.occurredAt.toISOString(),
    };

    this.channel.publish(
      "delivery.events",
      event.eventType,
      Buffer.from(JSON.stringify(message)),
      { persistent: true },
    );
  }
}
