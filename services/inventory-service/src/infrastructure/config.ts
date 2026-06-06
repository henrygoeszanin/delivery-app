export const dbConfig = {
  host: process.env.DB_HOST ?? "127.0.0.1",
  port: Number(process.env.DB_PORT ?? 5433),
  database: process.env.DB_NAME ?? "inventory",
  user: process.env.DB_USER ?? "postgres",
  password: process.env.DB_PASSWORD ?? "secret",
};
