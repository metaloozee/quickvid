CREATE TABLE IF NOT EXISTS "summaries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"videoid" text NOT NULL,
	"summary" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "videos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"videoid" text,
	"videotitle" text,
	"transcript" text,
	CONSTRAINT "videos_videoid_unique" UNIQUE("videoid")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "summaries" ADD CONSTRAINT "summaries_videoid_videos_videoid_fk" FOREIGN KEY ("videoid") REFERENCES "videos"("videoid") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
