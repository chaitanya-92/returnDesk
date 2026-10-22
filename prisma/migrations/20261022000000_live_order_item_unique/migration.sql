-- Enforce at most one live request per order item at the database level.
-- Closed or archived requests do not block a new request.
CREATE UNIQUE INDEX "ReturnRequest_one_live_order_item"
ON "ReturnRequest" ("orderNumber", "orderItemId")
WHERE "archivedAt" IS NULL AND "status" IN ('OPEN', 'IN_REVIEW', 'APPROVED');
