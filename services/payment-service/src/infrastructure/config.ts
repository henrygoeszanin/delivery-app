export const dbConfig = {
  host: process.env.DB_HOST ?? "127.0.0.1",
  port: Number(process.env.DB_PORT ?? 5434),
  database: process.env.DB_NAME ?? "payments",
  user: process.env.DB_USER ?? "postgres",
  password: process.env.DB_PASSWORD ?? "secret",
};

export const rabbitConfig = {
  url: process.env.RABBITMQ_URL ?? "amqp://guest:guest@localhost:5672",
  exchange: process.env.RABBITMQ_EXCHANGE ?? "delivery.events",
};
