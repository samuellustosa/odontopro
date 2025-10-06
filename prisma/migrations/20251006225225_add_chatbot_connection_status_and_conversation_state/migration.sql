-- CreateEnum
CREATE TYPE "ConnectionStatus" AS ENUM ('CONNECTED', 'DISCONNECTED', 'PENDING');

-- AlterTable
ALTER TABLE "ChatbotConfig" ADD COLUMN     "connectionStatus" "ConnectionStatus" NOT NULL DEFAULT 'DISCONNECTED';

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "conversationState" TEXT;
