import { describe, expect, it } from "vitest";
import { ALLOWED_TRANSITIONS } from "./types";
import { transitionSchema } from "./schemas";

describe("request lifecycle", () => {
  it("allows only the specified state transitions", () => {
    expect(ALLOWED_TRANSITIONS.OPEN).toEqual(["IN_REVIEW"]);
    expect(ALLOWED_TRANSITIONS.IN_REVIEW).toEqual(["APPROVED", "REJECTED"]);
    expect(ALLOWED_TRANSITIONS.APPROVED).toEqual(["COMPLETED"]);
    expect(ALLOWED_TRANSITIONS.REJECTED).toEqual([]);
    expect(ALLOWED_TRANSITIONS.COMPLETED).toEqual([]);
  });

  it("requires a resolution when approving", () => {
    expect(transitionSchema.safeParse({ status: "APPROVED" }).success).toBe(false);
    expect(transitionSchema.safeParse({ status: "APPROVED", resolution: "REPLACEMENT" }).success).toBe(true);
  });

  it("validates positive refund amounts", () => {
    expect(transitionSchema.safeParse({ status: "APPROVED", resolution: "REFUND", refundAmount: 0 }).success).toBe(false);
    expect(transitionSchema.safeParse({ status: "APPROVED", resolution: "REFUND", refundAmount: 29.99 }).success).toBe(true);
  });

  it("rejects refund amounts for non-refund resolutions at the service boundary", () => {
    expect(transitionSchema.safeParse({ status: "APPROVED", resolution: "STORE_CREDIT", refundAmount: -2 }).success).toBe(false);
  });
});
