import { SQL } from "bun";
import type { DbConfig } from "./types";

export function createConnection(config: DbConfig): SQL {
  return new SQL({
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.user,
    password: config.password,
    max: config.max ?? 10,
    ssl: config.ssl ?? false,
  });
}
