import type { OrderCreated } from "packages/order.events";
import type { ProcessPaymentUseCase } from "../../application/use-cases/proccesPaymentUseCase";
import type { Channel, ConsumeMessage } from "amqplib";

export class OrderCreatedConsumer {
  private readonly QUEUE = "payment-service.order.created";
  private readonly EXCHANGE = "delivery.events";
  private readonly ROUTING = "order.created";

  constructor(
    private readonly channel: Channel,
    private readonly useCase: ProcessPaymentUseCase,
  ) {}

  async start(): Promise<void> {
    await this.channel.assertExchange(this.EXCHANGE, "topic", {
      durable: true,
    });

    await this.channel.assertQueue(this.QUEUE, {
      durable: true,
      arguments: {
        "x-dead-letter-exchange": "delivery.events.dlx",
      },
    });

    await this.channel.bindQueue(this.QUEUE, this.EXCHANGE, this.ROUTING);

    // processa uma mensagem por vez
    this.channel.prefetch(1);

    this.channel.consume(this.QUEUE, async (msg: ConsumeMessage | null) => {
      if (!msg) return;

      try {
        const event: OrderCreated = JSON.parse(msg.content.toString());

        console.log({
          msg: "Consuming event",
          eventType: event.eventType,
          orderId: event.payload.orderId,
        });

        await this.useCase.execute(event.payload);

        // confirma que processou com sucesso
        this.channel.ack(msg);
      } catch (err) {
        console.error({
          msg: "Failed to process event",
          error: err,
        });

        // false = não recoloca na fila, vai para a dead-letter
        this.channel.nack(msg, false, false);
      }
    });

    console.log(`Consumer listening on queue: ${this.QUEUE}`);
  }
}
