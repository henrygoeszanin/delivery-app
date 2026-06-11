import Fastify, { type FastifyError } from "fastify";
import { join } from "node:path";
import {
  serializerCompiler,
  validatorCompiler,
  hasZodFastifySchemaValidationErrors,
  isResponseSerializationError,
} from "fastify-type-provider-zod";
import { migrate } from "@delivery/migrate";
import { db } from "./infrastructure/persistence/db";
import { paymentRoutes } from "./infrastructure/http/routes/paymentRoutes";
import { PaymentRepository } from "./infrastructure/persistence/paymentRepository";
import { CreatePaymentCodeUseCase } from "./application/use-cases/createPaymentCodeUseCase";
import amqp from "amqplib";
import { rabbitConfig } from "./infrastructure/config";
import { GetPixCodeConsumer } from "./infrastructure/messaging/getPixCodeConsumer";

await migrate(
  db,
  join(import.meta.dir, "infrastructure", "persistence", "migrations"),
);

const app = Fastify({ logger: true });

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.setErrorHandler((error, _request, reply) => {
  if (hasZodFastifySchemaValidationErrors(error)) {
    return reply.status(422).send({
      error: "ValidationError",
      message: "Validation error",
      issues: error.validation.map((issue) => ({
        field:
          issue.instancePath.replace(/^\//, "").replaceAll("/", ".") || "root",
        message: issue.message,
      })),
    });
  }

  if (isResponseSerializationError(error)) {
    return reply.status(500).send({
      error: "SerializationError",
      message: "Response serialization failed",
    });
  }

  const fastifyError = error as FastifyError;
  reply.status(fastifyError.statusCode ?? 500).send({
    error: "InternalServerError",
    message: fastifyError.message ?? "Internal server error",
  });
});

const connection = await amqp.connect(rabbitConfig.url);
const channel = await connection.createChannel();

const repo = new PaymentRepository(db);

const useCase = new CreatePaymentCodeUseCase(repo);

const consumer = new GetPixCodeConsumer(channel, useCase);
await consumer.start();

app.register(paymentRoutes, { prefix: "/api" });
app.get("/health", () => ({ status: "ok" }));

await app.listen({ port: 3004, host: "0.0.0.0" });
