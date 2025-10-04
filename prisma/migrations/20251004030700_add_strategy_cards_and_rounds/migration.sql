-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "currentRound" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "speakerPlayerId" TEXT;

-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "hasSpeaker" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "strategyCard" INTEGER;

-- AlterTable
ALTER TABLE "TurnHistory" ADD COLUMN     "roundNumber" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "Round" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "roundNumber" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "Round_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StrategyCardPick" (
    "id" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "cardNumber" INTEGER NOT NULL,
    "pickOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StrategyCardPick_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Round_gameId_idx" ON "Round"("gameId");

-- CreateIndex
CREATE INDEX "Round_roundNumber_idx" ON "Round"("roundNumber");

-- CreateIndex
CREATE INDEX "StrategyCardPick_roundId_idx" ON "StrategyCardPick"("roundId");

-- CreateIndex
CREATE INDEX "StrategyCardPick_playerId_idx" ON "StrategyCardPick"("playerId");

-- AddForeignKey
ALTER TABLE "Round" ADD CONSTRAINT "Round_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StrategyCardPick" ADD CONSTRAINT "StrategyCardPick_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StrategyCardPick" ADD CONSTRAINT "StrategyCardPick_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
