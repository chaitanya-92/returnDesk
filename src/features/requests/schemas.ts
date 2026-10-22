import * as yup from "yup";
import { REQUEST_REASONS, type RequestReason } from "./types";

const requiredText = (label: string, max = 180) =>
  yup
    .string()
    .trim()
    .required(`${label} is required`)
    .max(max, `${label} must be ${max} characters or fewer`);

export const requestDraftSchema = yup.object({
  orderNumber: requiredText("Order number", 80),
  orderItemId: requiredText("Order item ID", 100),
  itemName: requiredText("Item name"),
  itemSku: requiredText("Item SKU", 100),
  quantity: yup
    .number()
    .transform((value, original) => (original === "" ? NaN : value))
    .integer()
    .min(1)
    .max(1000)
    .required("Quantity is required"),
  customerName: requiredText("Customer name"),
  customerEmail: yup
    .string()
    .trim()
    .email("Enter a valid customer email")
    .max(254)
    .required("Customer email is required"),
  reason: yup
    .mixed<
      RequestReason
    >()
    .oneOf([...REQUEST_REASONS])
    .required("Reason is required"),
  description: requiredText("Description", 2000),
});

export const requestDetailsUpdateSchema = yup
  .object({
    orderNumber: requiredText("Order number", 80).optional(),
    orderItemId: requiredText("Order item ID", 100).optional(),
    itemName: requiredText("Item name").optional(),
    itemSku: requiredText("Item SKU", 100).optional(),
    quantity: yup.number().integer().min(1).max(1000).optional(),
    customerName: requiredText("Customer name").optional(),
    customerEmail: yup
      .string()
      .trim()
      .email("Enter a valid customer email")
      .max(254)
      .optional(),
    reason: yup
      .mixed<RequestReason>()
      .oneOf([...REQUEST_REASONS])
      .optional(),
    description: requiredText("Description", 2000).optional(),
  })
  .noUnknown()
  .test(
    "at-least-one-field",
    "Provide at least one field to update",
    (value) => !!value && Object.keys(value).length > 0,
  );

export const transitionSchema = yup
  .object({
    status: yup
      .mixed<"IN_REVIEW" | "APPROVED" | "REJECTED" | "COMPLETED">()
      .oneOf(["IN_REVIEW", "APPROVED", "REJECTED", "COMPLETED"])
      .required("Status is required"),
    resolution: yup
      .mixed<"REFUND" | "REPLACEMENT" | "STORE_CREDIT">()
      .oneOf(["REFUND", "REPLACEMENT", "STORE_CREDIT"])
      .when("status", {
        is: "APPROVED",
        then: (schema) =>
          schema.required("A resolution is required for approval"),
        otherwise: (schema) => schema.optional(),
      }),
    refundAmount: yup
      .number()
      .transform((value, original) => (original === "" ? undefined : value))
      .positive("Refund amount must be greater than zero")
      .max(1000000)
      .optional()
      .when(["status", "resolution"], {
        is: (status: string, resolution: string) =>
          status === "APPROVED" && resolution === "REFUND",
        then: (schema) =>
          schema.required("A positive refund amount is required for Refund"),
        otherwise: (schema) =>
          schema.test(
            "no-refund-amount",
            "Refund amount is only allowed for Refund resolution",
            function (value) {
              return value == null || this.parent.resolution === "REFUND";
            },
          ),
      }),
    note: yup.string().trim().max(1000).optional(),
  })
  .noUnknown();

export const noteSchema = yup
  .object({
    body: yup
      .string()
      .trim()
      .min(1, "Note cannot be empty")
      .max(2000)
      .required("Note body is required"),
    author: yup.string().trim().min(1).max(100).default("Operations team"),
  })
  .noUnknown();

export type RequestDraftInput = yup.InferType<typeof requestDraftSchema>;
export type RequestTransitionInput = yup.InferType<typeof transitionSchema>;
