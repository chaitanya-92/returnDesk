"use client";

import { AlertCircle, Plus, RefreshCw, X } from "lucide-react";
import type { FormikHelpers } from "formik";
import type { RequestDraft } from "@/features/requests/types";
import { RequestCreateForm } from "@/features/requests/components/request-create-form";
import { EMPTY_REQUEST_DRAFT } from "@/features/requests/request-form-data";

type RequestPageHeaderProps = {
  error: string;
  toast: { type: "success" | "error"; message: string } | null;
  setToast: (value: { type: "success" | "error"; message: string } | null) => void;
  load: () => Promise<void>;
  showCreate: boolean;
  setShowCreate: (value: boolean) => void;
  saving: boolean;
  fieldClassName: string;
  onCreateRequest: (values: RequestDraft, helpers: FormikHelpers<RequestDraft>) => Promise<void>;
};

export function RequestPageHeader({
  error,
  toast,
  setToast,
  load,
  showCreate,
  setShowCreate,
  saving,
  fieldClassName,
  onCreateRequest,
}: RequestPageHeaderProps) {
  const initialDraft = EMPTY_REQUEST_DRAFT;
  const field = fieldClassName;
  const createRequest = onCreateRequest;
  return (
    <>
<header className="flex flex-col justify-between gap-4 border-b border-[rgb(var(--border))] pb-5 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Return requests
            </h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => void load()}
              className="inline-flex items-center gap-2 rounded-lg border border-[rgb(var(--border))] px-3 py-2 text-sm"
            >
              <RefreshCw size={15} /> Refresh
            </button>
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="inline-flex items-center gap-2 rounded-lg bg-[#F2B719] px-4 py-2 text-sm font-semibold text-[#23221E]"
            >
              <Plus size={16} /> New request
            </button>
          </div>
        </header>
        {error && (
          <div
            role="alert"
            className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"
          >
            {error}
          </div>
        )}
        {toast?.type === "error" && (
          <div
            role="status"
            aria-live="polite"
            className={
              "fixed right-5 top-5 z-[100] flex w-[min(92vw,380px)] items-start gap-3 rounded-xl border p-4 shadow-xl " +
              "border-rose-200 bg-white text-rose-950"
            }
          >
            <span
              className={
                "mt-0.5 " +
                "text-rose-600"
              }
            >
              <AlertCircle size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">
                Something went wrong
              </p>
              <p className="mt-1 text-sm">{toast.message}</p>
            </div>
            <button
              aria-label="Dismiss notification"
              onClick={() => setToast(null)}
              className="rounded-md p-1 text-gray-500 hover:bg-gray-100"
            >
              <X size={16} />
            </button>
          </div>
        )}
        {showCreate && (
          <div
            className="fixed inset-0 z-[9999] flex min-h-dvh items-start justify-center overflow-y-auto bg-[#171714]/60 px-4 pb-6 pt-5 backdrop-blur-[3px] sm:items-center sm:py-6"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget && !saving) setShowCreate(false);
            }}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="create-request-title"
              className="relative my-auto max-h-[calc(100dvh-2.5rem)] w-full max-w-3xl overflow-y-auto overscroll-contain rounded-2xl border border-[#E8E8E3] bg-white p-5 text-[#23221E] shadow-2xl sm:max-h-[calc(100dvh-3rem)] sm:p-7"
            >
              <div className="mb-5 flex items-start justify-between gap-4 border-b border-[#ECECE7] pb-4">
                <div>
                  <h2
                    id="create-request-title"
                    className="text-lg font-semibold"
                  >
                    Create return request
                  </h2>
                  <p className="mt-1 text-sm text-[#6B685F]">
                    Enter the order and customer details to create a return.
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Close dialog"
                  disabled={saving}
                  onClick={() => setShowCreate(false)}
                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                >
                  <X size={18} />
                </button>
              </div>
              <RequestCreateForm
                initialValues={initialDraft}
                fieldClassName={field}
                saving={saving}
                onCancel={() => setShowCreate(false)}
                onSubmit={createRequest}
              />
            </section>
          </div>
        )}
    </>
  );
}
