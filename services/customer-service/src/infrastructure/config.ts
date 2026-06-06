export const dbConfig = {
  host: process.env.DB_HOST ?? "127.0.0.1",
  port: Number(process.env.DB_PORT ?? 5435),
  database: process.env.DB_NAME ?? "customers",
  user: process.env.DB_USER ?? "postgres",
  password: process.env.DB_PASSWORD ?? "secret",
};
