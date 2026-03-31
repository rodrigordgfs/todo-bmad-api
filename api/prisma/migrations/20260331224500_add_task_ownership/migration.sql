INSERT INTO "User" ("id", "email", "passwordHash", "createdAt", "updatedAt")
SELECT
  '00000000-0000-0000-0000-000000000001'::uuid,
  'tasks-owner@internal.local',
  '$argon2id$v=19$m=65536,t=3,p=4$225J9rkeY5N+nuRR89PDrQ$LrJV2cY8tgnjFyD8ENtNocZdxp5b5701i5r6iXrwpzc',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1
  FROM "User"
  WHERE "id" = '00000000-0000-0000-0000-000000000001'::uuid
);

ALTER TABLE "Task"
ADD COLUMN "userId" UUID;

UPDATE "Task"
SET "userId" = '00000000-0000-0000-0000-000000000001'::uuid
WHERE "userId" IS NULL;

ALTER TABLE "Task"
ALTER COLUMN "userId" SET NOT NULL;

ALTER TABLE "Task"
ADD CONSTRAINT "Task_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "Task_userId_status_idx" ON "Task"("userId", "status");
