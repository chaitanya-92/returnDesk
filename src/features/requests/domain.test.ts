import { describe, expect, it } from "vitest";
import { ALLOWED_TRANSITIONS } from "./types";
import { requestDraftSchema, transitionSchema } from "./schemas";

describe("request lifecycle rules", () => {
  it("allows only the specified state transitions", () => {
    expect(ALLOWED_TRANSITIONS.OPEN).toEqual(["IN_REVIEW"]);
    expect(ALLOWED_TRANSITIONS.IN_REVIEW).toEqual(["APPROVED", "REJECTED"]);
    expect(ALLOWED_TRANSITIONS.APPROVED).toEqual(["COMPLETED"]);
    expect(ALLOWED_TRANSITIONS.REJECTED).toEqual([]);
    expect(ALLOWED_TRANSITIONS.COMPLETED).toEqual([]);
  });

  it("requires a resolution when approving", async () => {
    await expect(transitionSchema.validate({ status: "APPROVED" })).rejects.toThrow();
    await expect(transitionSchema.validate({ status: "APPROVED", resolution: "REPLACEMENT" })).resolves.toMatchObject({ status: "APPROVED", resolution: "REPLACEMENT" });
  });

  it("requires a positive amount for refunds", async () => {
    await expect(transitionSchema.validate({ status: "APPROVED", resolution: "REFUND", refundAmount: 0 })).rejects.toThrow();
    await expect(transitionSchema.validate({ status: "APPROVED", resolution: "REFUND", refundAmount: 29.99 })).resolves.toMatchObject({ refundAmount: 29.99 });
  });

  it("does not allow refund amounts for non-refund resolutions", async () => {
    await expect(transitionSchema.validate({ status: "APPROVED", resolution: "STORE_CREDIT", refundAmount: 10 })).rejects.toThrow();
    await expect(transitionSchema.validate({ status: "APPROVED", resolution: "STORE_CREDIT" })).resolves.toMatchObject({ resolution: "STORE_CREDIT" });
  });

  it("validates request draft fields and normalizes whitespace", async () => {
    const input = {
      orderNumber: " ORD-1 ", orderItemId: " ITEM-1 ", itemName: " Bottle ", itemSku: " BOT-1 ",
      quantity: "2", customerName: " Alex Doe ", customerEmail: "alex@example.com",
      reason: "DAMAGED", description: " Lid cracked ",
    };
    await expect(requestDraftSchema.validate(input)).resolves.toMatchObject({
      orderNumber: "ORD-1", itemName: "Bottle", quantity: 2, description: "Lid cracked",
    });
    await expect(requestDraftSchema.validate({ ...input, customerEmail: "not-an-email" })).rejects.toThrow();
  });
});
