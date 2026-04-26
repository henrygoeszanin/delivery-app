import type { FastifyReply, FastifyRequest } from "fastify";
import type { TypePaymentWebhookDTO } from "../../../application/dtos/paymentWebhookDto";
import type { ConfirmPaymentWebhookUseCase } from "../../../application/use-cases/confirmPaymentWebhookUseCase";
import type { GetPaymentByOrderIdUseCase } from "services/payment-service/src/application/use-cases/getPaymentByOrderIdUseCase";

export class PaymentController {
  constructor(
    private readonly confirmPaymentWebhookUseCase: ConfirmPaymentWebhookUseCase,
    private readonly getPaymentByOrderIdUseCase: GetPaymentByOrderIdUseCase,
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

  async getPaymentByOrderId(
    request: FastifyRequest<{ Params: { orderId: string } }>,
    reply: FastifyReply,
  ) {
    const payment = this.getPaymentByOrderIdUseCase.execute(
      request.params.orderId,
    );

    if (!payment) {
      return reply.status(404).send({ message: "Payment not found" });
    }
    return reply.status(200).send(payment);
  }
}
