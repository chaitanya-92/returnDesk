"use client";

import {
  Formik,
  Form,
  Field,
  ErrorMessage,
  type FormikHelpers,
} from "formik";
import type { RequestDraft } from "@/features/requests/types";
import { requestDraftSchema } from "@/features/requests/schemas";
import { ReasonSelect } from "@/features/requests/components/reason-select";

type RequestFormProps = {
  initialValues: RequestDraft;
  fieldClassName: string;
  saving: boolean;
  onCancel: () => void;
  onSubmit: (values: RequestDraft, helpers: FormikHelpers<RequestDraft>) => Promise<void>;
};

export function RequestCreateForm({
  initialValues,
  fieldClassName,
  saving,
  onCancel,
  onSubmit,
}: RequestFormProps) {
  const field = fieldClassName;
  return (
              <Formik<RequestDraft>
                initialValues={initialValues}
                validationSchema={requestDraftSchema}
                onSubmit={onSubmit}
              >
                {({ isSubmitting, isValid, dirty }) => (
                  <Form
                    className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-3"
                    noValidate
                  >
                    <label className="space-y-1.5 text-xs font-medium">
                      Order number *
                      <Field
                        name="orderNumber"
                        placeholder="e.g. ORD-52001"
                        autoComplete="off"
                        className={field}
                      />
                      <ErrorMessage
                        name="orderNumber"
                        component="span"
                        className="block text-xs font-medium text-rose-600"
                      />
                    </label>
                    <label className="space-y-1.5 text-xs font-medium">
                      Order item ID *
                      <Field
                        name="orderItemId"
                        placeholder="e.g. ORD-52001-01"
                        autoComplete="off"
                        className={field}
                      />
                      <ErrorMessage
                        name="orderItemId"
                        component="span"
                        className="block text-xs font-medium text-rose-600"
                      />
                    </label>
                    <label className="space-y-1.5 text-xs font-medium">
                      Item name *
                      <Field
                        name="itemName"
                        placeholder="e.g. Everyday Bottle 750 ml"
                        autoComplete="off"
                        className={field}
                      />
                      <ErrorMessage
                        name="itemName"
                        component="span"
                        className="block text-xs font-medium text-rose-600"
                      />
                    </label>
                    <label className="space-y-1.5 text-xs font-medium">
                      Item SKU *
                      <Field
                        name="itemSku"
                        placeholder="e.g. BOT-750-BLK"
                        autoComplete="off"
                        className={field}
                      />
                      <ErrorMessage
                        name="itemSku"
                        component="span"
                        className="block text-xs font-medium text-rose-600"
                      />
                    </label>
                    <label className="space-y-1.5 text-xs font-medium">
                      Quantity *
                      <Field
                        name="quantity"
                        type="number"
                        min="1"
                        max="1000"
                        className={field}
                      />
                      <ErrorMessage
                        name="quantity"
                        component="span"
                        className="block text-xs font-medium text-rose-600"
                      />
                    </label>
                    <label className="space-y-1.5 text-xs font-medium">
                      Customer name *
                      <Field
                        name="customerName"
                        placeholder="Full name"
                        autoComplete="name"
                        className={field}
                      />
                      <ErrorMessage
                        name="customerName"
                        component="span"
                        className="block text-xs font-medium text-rose-600"
                      />
                    </label>
                    <label className="space-y-1.5 text-xs font-medium">
                      Customer email *
                      <Field
                        name="customerEmail"
                        type="email"
                        placeholder="customer@example.com"
                        autoComplete="email"
                        className={field}
                      />
                      <ErrorMessage
                        name="customerEmail"
                        component="span"
                        className="block text-xs font-medium text-rose-600"
                      />
                    </label>
                    <div className="space-y-1.5 text-xs font-medium">
                      <label htmlFor="reason-menu-trigger" className="block">
                        Return reason *
                      </label>
                      <ReasonSelect />
                    </div>
                    <label className="space-y-1.5 text-xs font-medium sm:col-span-2 lg:col-span-3">
                      Description *
                      <Field
                        as="textarea"
                        name="description"
                        placeholder="Describe the issue and any relevant details…"
                        maxLength={2000}
                        rows={3}
                        className={field}
                      />
                      <ErrorMessage
                        name="description"
                        component="span"
                        className="block text-xs font-medium text-rose-600"
                      />
                    </label>
                    <div className="flex justify-end gap-2 sm:col-span-2 lg:col-span-3">
                      <button
                        type="submit"
                        disabled={saving || isSubmitting || !isValid || !dirty}
                        className="rounded-lg bg-[#F2B719] px-4 py-2.5 text-sm font-semibold text-[#23221E] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {saving || isSubmitting
                          ? "Creating…"
                          : "Create request"}
                      </button>
                      <button
                        type="button"
                        onClick={() => onCancel()}
                        disabled={saving}
                        className="rounded-lg border border-[#DCDCD5] bg-white px-4 py-2.5 text-sm text-[#23221E] hover:bg-[#F7F7F5] disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
  );
}
