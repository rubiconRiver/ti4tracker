-- AlterTable
ALTER TABLE "Game" ALTER COLUMN "currentPlayerTurnOrder" SET DEFAULT 1;

-- Update existing player turn orders from 0-based to 1-based (0->1, 1->2, etc.)
UPDATE "Player" SET "turnOrder" = "turnOrder" + 1 WHERE "turnOrder" < 8;

-- Update existing game currentPlayerTurnOrder from 0-based to 1-based
UPDATE "Game" SET "currentPlayerTurnOrder" = "currentPlayerTurnOrder" + 1 WHERE "currentPlayerTurnOrder" < 8;
