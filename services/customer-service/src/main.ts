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
import { customerRoutes } from "./infrastructure/http/routes/customerRoutes";

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

app.register(customerRoutes, { prefix: "/api" });
app.get("/health", () => ({ status: "ok" }));

await app.listen({ port: 3003, host: "0.0.0.0" });
