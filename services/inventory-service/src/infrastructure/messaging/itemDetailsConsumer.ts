import type { Channel, ConsumeMessage } from "amqplib";
import { GetItemsByIdsUseCase } from "../../application/use-cases/getProductsByIdUseCase";
import {
  EXCHANGE_GET_ITEMS_DETAILS,
  type GetItemsDetails,
  type ItemDetails,
} from "packages/order.events";

export class ItemDetailsConsumer {
  private readonly EXCHANGE = EXCHANGE_GET_ITEMS_DETAILS;
  private readonly QUEUE = "inventory-service.get.items.details";

  constructor(
    private readonly channel: Channel,
    private readonly getItemsByIdsUseCase: GetItemsByIdsUseCase,
  ) {}

  async start(): Promise<void> {
    await this.channel.assertExchange(this.EXCHANGE, "topic", {
      durable: true,
    });

    await this.channel.assertQueue(this.QUEUE, { durable: true });

    await this.channel.bindQueue(this.QUEUE, this.EXCHANGE, this.QUEUE);

    this.channel.prefetch(1);

    this.channel.consume(
      this.QUEUE,
      async (msg: ConsumeMessage | null) => {
        if (!msg) return;

        try {
          const event: GetItemsDetails = JSON.parse(msg.content.toString());

          console.debug(
            `Received event ${event.eventType} with correlationId ${event.eventId} for order ${event.payload.itemIds.join(", ")}`,
          );

          const { itemIds } = event.payload;

          const items = await this.getItemsByIdsUseCase.execute(itemIds);

          const itemDetails: ItemDetails[] = items
            .filter((p): p is NonNullable<typeof p> => p !== null)
            .map((p) => ({
              productId: p.id,
              name: p.name,
              unitPrice: p.price,
              quantity: p.stock,
            }));

          if (msg.properties.replyTo) {
            this.channel.publish(
              "",
              msg.properties.replyTo,
              Buffer.from(JSON.stringify(itemDetails)),
              { correlationId: msg.properties.correlationId },
            );
          }

          this.channel.ack(msg);
        } catch (error) {
          console.error({
            msg: "Failed to process get.items.details",
            error,
          });
          this.channel.nack(msg, false, false);
        }
      },
      { noAck: false },
    );
  }
}
