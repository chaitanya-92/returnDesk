import { z } from "zod";

const requiredText = (label: string, max = 180) =>
  z.string().trim().min(1, `${label} is required`).max(max, `${label} must be ${max} characters or fewer`);

export const requestDraftSchema = z.object({
  orderNumber: requiredText("Order number", 80),
  orderItemId: requiredText("Order item ID", 100),
  itemName: requiredText("Item name"),
  itemSku: requiredText("Item SKU", 100),
  quantity: z.coerce.number().int().min(1).max(1000),
  customerName: requiredText("Customer name"),
  customerEmail: z.string().trim().email().max(254),
  reason: z.enum(["DAMAGED", "WRONG_ITEM", "WRONG_SIZE", "NOT_AS_DESCRIBED", "CHANGED_MIND", "MISSING_PARTS", "OTHER"]),
  description: requiredText("Description", 2000),
});

export const requestDetailsUpdateSchema = requestDraftSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  "Provide at least one field to update",
);

export const transitionSchema = z.discriminatedUnion("status", [
  z.object({ status: z.literal("IN_REVIEW") }),
  z.object({ status: z.literal("REJECTED"), note: z.string().trim().max(1000).optional() }),
  z.object({
    status: z.literal("APPROVED"),
    resolution: z.enum(["REFUND", "REPLACEMENT", "STORE_CREDIT"]),
    refundAmount: z.coerce.number().positive().max(1000000).optional(),
    note: z.string().trim().max(1000).optional(),
  }),
  z.object({ status: z.literal("COMPLETED"), note: z.string().trim().max(1000).optional() }),
]);

export const noteSchema = z.object({
  body: z.string().trim().min(1).max(2000),
  author: z.string().trim().min(1).max(100).default("Operations team"),
});

export type RequestDraftInput = z.infer<typeof requestDraftSchema>;
export type RequestTransitionInput = z.infer<typeof transitionSchema>;
