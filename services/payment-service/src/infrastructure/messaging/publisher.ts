import type { Channel } from "amqplib";
import type { IEventPublisher } from "../../domain/messaging/IEventPublisher";
import type { PixGenerated } from "packages/order.events";

export class RabbitMQPublisher implements IEventPublisher {
  constructor(private readonly channel: Channel) {}

  async publish(event: PixGenerated): Promise<void> {
    const message = {
      ...event,
      occurredAt: event.occurredAt.toISOString(),
    };

    this.channel.publish(
      "payment.events",
      event.eventType,
      Buffer.from(JSON.stringify(message)),
      { persistent: true },
    );
  }
}
