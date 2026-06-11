import type { Channel, ConsumeMessage } from "amqplib";
import type { IProductRepository } from "../../domain/repositories/IOrderRepository";
import type { ItemDetails } from "packages/order.events";

export class ItemDetailsConsumer {
  private readonly EXCHANGE = "get.items.details";
  private readonly QUEUE = "inventory-service.get.items.details";

  constructor(
    private readonly channel: Channel,
    private readonly productRepo: IProductRepository,
  ) {}

  async start(): Promise<void> {
    await this.channel.assertExchange(this.EXCHANGE, "topic", {
      durable: true,
    });

    await this.channel.assertQueue(this.QUEUE, { durable: true });

    await this.channel.bindQueue(
      this.QUEUE,
      this.EXCHANGE,
      "get.items.details",
    );

    this.channel.prefetch(1);

    this.channel.consume(
      this.QUEUE,
      async (msg: ConsumeMessage | null) => {
        if (!msg) return;

        try {
          const event = JSON.parse(msg.content.toString());
          const { itemIds } = event.payload;

          const products = await Promise.all(
            itemIds.map((id: string) => this.productRepo.findById(id)),
          );

          const itemDetails: ItemDetails[] = products
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
