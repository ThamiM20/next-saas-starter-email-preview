-- Add user_emails table for email forwarding
CREATE TABLE IF NOT EXISTS "user_emails" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "email" varchar(255) NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "user_emails_user_id_email_unique" UNIQUE("user_id", "email")
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS "user_emails_user_id_idx" ON "user_emails" ("user_id");
CREATE INDEX IF NOT EXISTS "user_emails_email_idx" ON "user_emails" ("email");

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON "user_emails" TO service_role;
GRANT USAGE, SELECT ON SEQUENCE "user_emails_id_seq" TO service_role;
