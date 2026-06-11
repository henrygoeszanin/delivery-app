import { migrate } from "@delivery/migrate";
import { join } from "node:path";
import { db } from "./infrastructure/persistence/db";
import Fastify, { type FastifyError } from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
  hasZodFastifySchemaValidationErrors,
  isResponseSerializationError,
} from "fastify-type-provider-zod";
import { inventoryRoutes } from "./infrastructure/http/routes/inventoryRoutes";
import { config } from "dotenv";
import amqp from "amqplib";
import { ProductRepository } from "./infrastructure/persistence/productRepository";
import { ItemDetailsConsumer } from "./infrastructure/messaging/itemDetailsConsumer";
import { rabbitConfig } from "./infrastructure/config";
import { GetItemsByIdsUseCase } from "./application/use-cases/getProductsByIdUseCase";

config();

await migrate(
  db,
  join(import.meta.dir, "infrastructure", "persistence", "migrations"),
);

const connection = await amqp.connect(rabbitConfig.url);
const channel = await connection.createChannel();

const productRepository = new ProductRepository(db);
const useCase = new GetItemsByIdsUseCase(productRepository);
const itemDetailsConsumer = new ItemDetailsConsumer(channel, useCase);
await itemDetailsConsumer.start();

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
          issue.instancePath.replace(/^\//, "").replaceAll(/\//g, ".") ||
          "root",
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

app.register(inventoryRoutes, { prefix: "/api" });
app.get("/health", () => ({ status: "ok" }));

await app.listen({ port: 3002, host: "0.0.0.0" });
