ALTER TABLE "servers" ADD COLUMN "managerRoleId" varchar(255);--> statement-breakpoint
ALTER TABLE "servers" ALTER COLUMN "key" DROP NOT NULL;