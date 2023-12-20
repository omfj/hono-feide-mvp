CREATE TABLE IF NOT EXISTS "account" (
	"user_id" text NOT NULL,
	"provider" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	CONSTRAINT account_provider_account_id_provider_pk PRIMARY KEY("provider_account_id","provider")
);
--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN IF EXISTS "provider";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN IF EXISTS "provider_id";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
