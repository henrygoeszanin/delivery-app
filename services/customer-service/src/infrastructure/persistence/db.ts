import { createConnection } from "@delivery/db";
import { dbConfig } from "../config";

export const db = createConnection(dbConfig);
