import type { FastifyReply, FastifyRequest } from "fastify";
import type { TypePaymentWebhookDTO } from "../../../application/dtos/paymentWebhookDto";
import type { ConfirmPaymentWebhookUseCase } from "../../../application/use-cases/confirmPaymentWebhookUseCase";

export class PaymentController {
  constructor(
    private readonly confirmPaymentWebhookUseCase: ConfirmPaymentWebhookUseCase,
  ) {}

  async webhook(
    request: FastifyRequest<{ Body: TypePaymentWebhookDTO }>,
    reply: FastifyReply,
  ) {
    const payment = await this.confirmPaymentWebhookUseCase.execute(
      request.body,
    );
    return reply.status(200).send(payment);
  }
}
