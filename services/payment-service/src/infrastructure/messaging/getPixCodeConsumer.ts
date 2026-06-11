import type { Channel, ConsumeMessage } from "amqplib";
import { EXCHANGE_GET_PIX_CODE, type GetPixCode } from "packages/order.events";
import type { CreatePaymentCodeUseCase } from "../../application/use-cases/createPaymentCodeUseCase";

export class GetPixCodeConsumer {
  private readonly EXCHANGE = EXCHANGE_GET_PIX_CODE;
  private readonly QUEUE = "payment-service.get.pix.code";

  constructor(
    private readonly channel: Channel,
    private readonly createPaymentCodeUseCase: CreatePaymentCodeUseCase,
  ) {}

  async start(): Promise<void> {
    console.debug(`Starting GetPixCodeConsumer...`);
    await this.channel.assertExchange(this.EXCHANGE, "topic", {
      durable: true,
    });

    await this.channel.assertQueue(this.QUEUE, {
      durable: true,
    });

    await this.channel.bindQueue(this.QUEUE, this.EXCHANGE, this.QUEUE);

    this.channel.prefetch(1);

    this.channel.consume(
      this.QUEUE,
      async (msg: ConsumeMessage | null) => {
        if (!msg) return;

        try {
          const event: GetPixCode = JSON.parse(msg.content.toString());

          console.debug(
            `Received event ${event.eventType} with correlationId ${event.eventId} for order ${event.payload.orderId}`,
          );

          const result = await this.createPaymentCodeUseCase.execute(
            event.payload,
          );

          if (msg.properties.replyTo) {
            this.channel.publish(
              "",
              msg.properties.replyTo,
              Buffer.from(JSON.stringify(result)),
              {
                correlationId: msg.properties.correlationId,
              },
            );
          }

          this.channel.ack(msg);
        } catch (err) {
          console.error({
            msg: "Failed to process get.pix.code",
            error: err,
          });

          this.channel.nack(msg, false, false);
        }
      },
      { noAck: false },
    );

    console.log(`Consumer listening on queue: ${this.QUEUE}`);
  }
}
