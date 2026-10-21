import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn("flex h-9 w-full rounded-lg border border-[#e9e6d9] bg-white px-3 py-2 text-sm text-[#252419] shadow-sm transition-colors placeholder:text-[#a09e90] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e5cc39] disabled:cursor-not-allowed disabled:opacity-50", className)}
      ref={ref}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };
