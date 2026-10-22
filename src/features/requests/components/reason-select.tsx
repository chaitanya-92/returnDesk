"use client";

import { useState } from "react";
import { useField } from "formik";
import { REQUEST_REASON_OPTIONS } from "@/features/requests/request-form-data";
import { formatRequestStatus } from "@/features/requests/presentation";

const reasons = REQUEST_REASON_OPTIONS;
const pretty = formatRequestStatus;

export function ReasonSelect() {
  const [field, meta, helpers] = useField<string>("reason");
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        id="reason-menu-trigger"
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-lg border border-[#DCDCD5] bg-white px-3 py-2.5 text-left text-sm font-normal text-[#23221E] shadow-sm hover:bg-[#FFFDF5] focus:outline-none focus:ring-2 focus:ring-[#F2B719]/40"
      >
        <span>{pretty(field.value)}</span>
        <span aria-hidden="true" className="text-[#59523D]">
          ⌄
        </span>
      </button>
      {open && (
        <>
          <button
            type="button"
            aria-label="Close return reason menu"
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          ></button>
          <div
            role="listbox"
            aria-label="Return reason"
            className="absolute left-0 top-full z-50 mt-2 max-h-56 w-full overflow-y-auto rounded-xl border border-[#E1DFD6] bg-white p-1.5 text-[#23221E] shadow-xl ring-1 ring-black/5"
          >
            {reasons.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                role="option"
                aria-selected={field.value === value}
                onClick={() => {
                  void helpers.setValue(value);
                  void helpers.setTouched(true);
                  setOpen(false);
                }}
                className={
                  "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors " +
                  (field.value === value
                    ? "bg-[#FFF0A6] text-[#23221E]"
                    : "bg-white text-[#38362F] hover:bg-[#FFF9DC] hover:text-[#23221E]")
                }
              >
                {label}
                {field.value === value && <span aria-hidden="true">✓</span>}
              </button>
            ))}
          </div>
        </>
      )}
      {meta.touched && meta.error && (
        <span className="mt-1 block text-xs font-medium text-rose-600">
          {meta.error}
        </span>
      )}
    </div>
  );
}
