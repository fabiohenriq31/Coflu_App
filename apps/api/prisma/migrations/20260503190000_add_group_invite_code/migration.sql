ALTER TABLE "financial_groups" ADD COLUMN "invite_code" VARCHAR(12);

UPDATE "financial_groups"
SET "invite_code" = upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))
WHERE "invite_code" IS NULL;

ALTER TABLE "financial_groups" ALTER COLUMN "invite_code" SET NOT NULL;

CREATE UNIQUE INDEX "financial_groups_invite_code_key" ON "financial_groups"("invite_code");
CREATE INDEX "financial_groups_invite_code_idx" ON "financial_groups"("invite_code");
