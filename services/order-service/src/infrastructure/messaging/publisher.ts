import type { Channel } from "amqplib";
import type { IEventPublisher } from "../../domain/messaging/IEventPubliser";
import {
  EXCHANGE_GET_ITEMS_DETAILS,
  EXCHANGE_ORDER_CREATED,
  type GetItemsDetails,
  type ItemDetails,
  type OrderCreated,
} from "packages/order.events";

export class RabbitMQPublisher implements IEventPublisher {
  constructor(private readonly channel: Channel) {}

  async createOrder(event: OrderCreated): Promise<void> {
    const message = {
      ...event,
      occurredAt: event.occurredAt.toISOString(),
    };

    this.channel.publish(
      EXCHANGE_ORDER_CREATED,
      event.eventType,
      Buffer.from(JSON.stringify(message)),
      { persistent: true },
    );
  }
  async getItemsData(event: GetItemsDetails): Promise<ItemDetails[]> {
    const correlationId = crypto.randomUUID();

    return new Promise((resolve, reject) => {
      (async () => {
        try {
          const { queue } = await this.channel.assertQueue("", {
            exclusive: true,
            autoDelete: true,
          });

          this.channel.consume(
            queue,
            (msg) => {
              if (msg?.properties.correlationId === correlationId) {
                const response: ItemDetails[] = JSON.parse(
                  msg.content.toString(),
                );
                resolve(response);
                this.channel.cancel(msg.fields.consumerTag);
              }
            },
            { noAck: true },
          );

          const message = {
            ...event,
            occurredAt: event.occurredAt.toISOString(),
          };

          this.channel.publish(
            EXCHANGE_GET_ITEMS_DETAILS,
            event.eventType,
            Buffer.from(JSON.stringify(message)),
            {
              persistent: true,
              replyTo: queue,
              correlationId,
            },
          );

          setTimeout(() => {
            reject(new Error("Timeout waiting for item details"));
          }, 30000);
        } catch (error) {
          reject(error);
        }
      })();
    });
  }
}
