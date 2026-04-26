import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { PaymentWebhookDTO } from "../../../application/dtos/paymentWebhookDto";
import { PaymentController } from "../controllers/paymentController";
import { db } from "../../persistence/db";
import { PaymentRepository } from "../../persistence/paymentRepository";
import { ConfirmPaymentWebhookUseCase } from "../../../application/use-cases/confirmPaymentWebhookUseCase";
import type { IPaymentRepository } from "../../../domain/repositories/IPaymentRepository";

export async function paymentRoutes(app: FastifyInstance) {
  const fastify = app.withTypeProvider<ZodTypeProvider>();

  const repo: IPaymentRepository = new PaymentRepository(db);
  const controller = new PaymentController(
    new ConfirmPaymentWebhookUseCase(repo),
  );

  fastify.post(
    "/payments/webhook",
    {
      schema: { body: PaymentWebhookDTO },
    },
    (req, reply) => controller.webhook(req, reply),
  );

  fastify.get<{ Params: { id: string } }>(
    "/payments/:id",
    {
      schema: { params: z.object({ id: z.uuid() }) },
    },
    async (req, reply) => {
      const payment = await repo.findById(req.params.id);
      if (!payment) {
        return reply.status(404).send({ message: "Payment not found" });
      }
      return reply.status(200).send(payment);
    },
  );
}
