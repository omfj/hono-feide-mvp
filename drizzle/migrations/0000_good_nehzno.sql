CREATE TABLE IF NOT EXISTS "session" (
	"id" text NOT NULL,
	"user_id" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	CONSTRAINT session_id_pk PRIMARY KEY("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" text NOT NULL,
	"name" text,
	"email" text,
	"provider" text,
	"provider_id" text,
	CONSTRAINT user_id_pk PRIMARY KEY("id")
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "unique_email_idx" ON "user" ("email");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
