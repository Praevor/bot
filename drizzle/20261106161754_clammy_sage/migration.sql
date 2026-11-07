CREATE TABLE "moderations" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "moderations_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"serverId" varchar(255) NOT NULL,
	"robloxUsername" varchar(255) NOT NULL,
	"robloxId" varchar(255) NOT NULL,
	"punishmentType" text NOT NULL,
	"moderatorId" varchar(255) NOT NULL
);
