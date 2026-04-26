export type DbConfig = {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  max?: number; // pool size
  ssl?: boolean;
};
