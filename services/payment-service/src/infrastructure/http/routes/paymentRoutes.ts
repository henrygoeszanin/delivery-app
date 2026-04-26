import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import {
  PaymentWebhookDTO,
  type TypePaymentWebhookDTO,
} from "../../../application/dtos/paymentWebhookDto";
import { PaymentController } from "../controllers/paymentController";
import { db } from "../../persistence/db";
import { PaymentRepository } from "../../persistence/paymentRepository";
import { ConfirmPaymentWebhookUseCase } from "../../../application/use-cases/confirmPaymentWebhookUseCase";
import type { IPaymentRepository } from "../../../domain/repositories/IPaymentRepository";
import { GetPaymentByOrderIdUseCase } from "services/payment-service/src/application/use-cases/getPaymentByOrderIdUseCase";

export async function paymentRoutes(app: FastifyInstance) {
  const fastify = app.withTypeProvider<ZodTypeProvider>();

  const repo: IPaymentRepository = new PaymentRepository(db);
  const controller = new PaymentController(
    new ConfirmPaymentWebhookUseCase(repo),
    new GetPaymentByOrderIdUseCase(repo),
  );

  fastify.post<{ Body: TypePaymentWebhookDTO }>(
    "/payments/webhook",
    {
      schema: { body: PaymentWebhookDTO },
    },
    (req, reply) => controller.webhook(req, reply),
  );

  fastify.get<{ Params: { orderId: string } }>(
    "/payments/:orderId",
    {
      schema: { params: z.object({ orderId: z.uuid() }) },
    },
    (req, reply) => controller.getPaymentByOrderId(req, reply),
  );
}
