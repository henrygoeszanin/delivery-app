import { join } from "node:path";
import { migrate } from "@delivery/migrate";
import { db } from "./db";

await migrate(db, join(import.meta.dir, "migrations"));
