import type { Channel, ConsumeMessage } from "amqplib";
import type { IOrderRepository } from "../../domain/repositories/IOrderRepository";
import type { PixGenerated } from "packages/order.events";
export class PaymentPixGeneratedConsumer {
  private readonly QUEUE = "order-service.payment.pix_generated";
  private readonly EXCHANGE = "delivery.events";
  private readonly ROUTING = "payment.pix_generated";

  constructor(
    private readonly channel: Channel,
    private readonly orderRepo: IOrderRepository,
  ) {}

  async start(): Promise<void> {
    await this.channel.assertExchange(this.EXCHANGE, "topic", {
      durable: true,
    });

    await this.channel.assertQueue(this.QUEUE, { durable: true });

    await this.channel.bindQueue(this.QUEUE, this.EXCHANGE, this.ROUTING);

    this.channel.prefetch(1);

    this.channel.consume(this.QUEUE, async (msg: ConsumeMessage | null) => {
      if (!msg) return;

      try {
        const event: PixGenerated = JSON.parse(msg.content.toString());
        const { orderId, pixCode, paymentId } = event.payload;

        // busca o pedido e atualiza com os dados do Pix
        const order = await this.orderRepo.findById(orderId);
        if (!order) {
          this.channel.nack(msg, false, false);
          return;
        }

        order.attachPixCode(pixCode, paymentId);
        await this.orderRepo.update(order);

        this.channel.ack(msg);
      } catch (err) {
        console.error({
          msg: "Failed to process payment.pix_generated",
          error: err,
        });
        this.channel.nack(msg, false, false);
      }
    });
  }
}
