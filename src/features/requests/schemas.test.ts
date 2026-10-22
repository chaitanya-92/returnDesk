import { describe, expect, it } from "vitest";
import { requestDraftSchema, transitionSchema, noteSchema } from "./schemas";
const draft = {
  orderNumber: "ORD-52001",
  orderItemId: "ORD-52001-01",
  itemName: "Bottle",
  itemSku: "BOT-750",
  quantity: 1,
  customerName: "Avery Johnson",
  customerEmail: "avery@example.com",
  reason: "DAMAGED",
  description: "Bottle arrived damaged",
};
describe("requestDraftSchema", () => {
  it("accepts valid data", async () => {
    await expect(requestDraftSchema.validate(draft)).resolves.toMatchObject(
      draft,
    );
  });
  it("rejects invalid email", async () => {
    await expect(
      requestDraftSchema.validate({ ...draft, customerEmail: "bad" }),
    ).rejects.toThrow();
  });
  it("rejects invalid quantity", async () => {
    await expect(
      requestDraftSchema.validate({ ...draft, quantity: 0 }),
    ).rejects.toThrow();
  });
});
describe("transitionSchema", () => {
  it("requires a positive refund amount", async () => {
    await expect(
      transitionSchema.validate({
        status: "APPROVED",
        resolution: "REFUND",
        refundAmount: 0,
      }),
    ).rejects.toThrow();
  });
  it("allows replacement without amount", async () => {
    await expect(
      transitionSchema.validate({
        status: "APPROVED",
        resolution: "REPLACEMENT",
      }),
    ).resolves.toMatchObject({ status: "APPROVED" });
  });
});
describe("noteSchema", () => {
  it("rejects blank notes", async () => {
    await expect(noteSchema.validate({ body: " " })).rejects.toThrow();
  });
});
