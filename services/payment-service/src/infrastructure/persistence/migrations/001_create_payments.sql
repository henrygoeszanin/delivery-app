CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY,
  order_id UUID NOT NULL,
  pix_code VARCHAR(255),
  payment_method VARCHAR(32) NOT NULL,
  failure_reason VARCHAR(255),
  amount NUMERIC(12, 2) NOT NULL,
  issued_at TIMESTAMP NOT NULL,
  status VARCHAR(32) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
