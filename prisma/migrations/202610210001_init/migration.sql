CREATE TYPE "RequestStatus" AS ENUM ('OPEN', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'COMPLETED');
CREATE TYPE "ResolutionType" AS ENUM ('REFUND', 'REPLACEMENT', 'STORE_CREDIT');
CREATE TYPE "RequestEventType" AS ENUM ('CREATED', 'DETAILS_UPDATED', 'STATUS_CHANGED', 'NOTE_ADDED', 'ARCHIVED');

CREATE TABLE "ReturnRequest" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "itemSku" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'OPEN',
    "resolution" "ResolutionType",
    "refundAmount" DECIMAL(10,2),
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ReturnRequest_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ReturnRequest_quantity_positive" CHECK ("quantity" > 0),
    CONSTRAINT "ReturnRequest_resolution_refund_consistency" CHECK (
      ("resolution" = 'REFUND' AND "refundAmount" IS NOT NULL AND "refundAmount" > 0)
      OR ("resolution" IS DISTINCT FROM 'REFUND' AND "refundAmount" IS NULL)
      OR ("resolution" IS NULL AND "refundAmount" IS NULL)
    )
);

CREATE TABLE "RequestNote" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "author" TEXT NOT NULL DEFAULT 'Operations team',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RequestNote_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RequestEvent" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "type" "RequestEventType" NOT NULL,
    "fromStatus" "RequestStatus",
    "toStatus" "RequestStatus",
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RequestEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ReturnRequest_reference_key" ON "ReturnRequest"("reference");
CREATE INDEX "ReturnRequest_status_archivedAt_createdAt_idx" ON "ReturnRequest"("status", "archivedAt", "createdAt");
CREATE INDEX "ReturnRequest_orderNumber_orderItemId_idx" ON "ReturnRequest"("orderNumber", "orderItemId");
CREATE INDEX "ReturnRequest_customerEmail_idx" ON "ReturnRequest"("customerEmail");
CREATE INDEX "RequestNote_requestId_createdAt_idx" ON "RequestNote"("requestId", "createdAt");
CREATE INDEX "RequestEvent_requestId_createdAt_idx" ON "RequestEvent"("requestId", "createdAt");

CREATE UNIQUE INDEX "ReturnRequest_one_active_per_order_item"
ON "ReturnRequest" ("orderNumber", "orderItemId")
WHERE "archivedAt" IS NULL AND "status" IN ('OPEN', 'IN_REVIEW', 'APPROVED');

ALTER TABLE "RequestNote" ADD CONSTRAINT "RequestNote_requestId_fkey"
FOREIGN KEY ("requestId") REFERENCES "ReturnRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RequestEvent" ADD CONSTRAINT "RequestEvent_requestId_fkey"
FOREIGN KEY ("requestId") REFERENCES "ReturnRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
