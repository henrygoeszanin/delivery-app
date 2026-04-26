import type { SQL } from "bun";

declare module "fastify" {
  interface FastifyInstance {
    db: SQL;
  }
}
