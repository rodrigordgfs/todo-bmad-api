CREATE UNIQUE INDEX "RefreshToken_single_active_session_per_user_idx"
ON "RefreshToken" ("userId")
WHERE "revokedAt" IS NULL;
