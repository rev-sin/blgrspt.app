ALTER TABLE "post" ADD COLUMN "visibility" text DEFAULT 'private' NOT NULL;--> statement-breakpoint
UPDATE "post" SET "visibility" = 'public' WHERE "status" = 'published';--> statement-breakpoint
CREATE INDEX "post_visibility_idx" ON "post" USING btree ("visibility");
