ALTER TABLE orders
  ADD COLUMN pix_code   VARCHAR(255) NULL,
  ADD COLUMN payment_id UUID         NULL;