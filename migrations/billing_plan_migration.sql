ALTER TABLE users
  ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS plan_granted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT,
  ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;
ALTER TABLE users
  DROP CONSTRAINT IF EXISTS users_plan_check;
ALTER TABLE users
  ADD CONSTRAINT users_plan_check CHECK (plan IN ('free', 'starter', 'pro'));

COMMENT ON COLUMN users.plan IS
  'Billing plan in force. Written only by a signature-verified Razorpay payment; see lib/billing.ts.';
COMMENT ON COLUMN users.plan_granted_at IS
  'When the current plan was granted. Payment is one-off, so there is no expiry.';
COMMENT ON COLUMN users.razorpay_payment_id IS
  'The payment that granted the current plan. Unique, so replaying a webhook cannot double-grant.';
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_razorpay_payment
  ON users (razorpay_payment_id)
  WHERE razorpay_payment_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_email_plan ON users (email, plan);
