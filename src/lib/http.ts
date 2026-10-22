import { NextResponse } from "next/server";
import { ValidationError } from "yup";

export class AppError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function apiError(error: unknown) {
  if (error instanceof ValidationError) {
    return NextResponse.json(
      {
        error: "Validation failed",
        code: "VALIDATION_ERROR",
        issues: error.errors,
      },
      { status: 400 },
    );
  }
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.status },
    );
  }
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  ) {
    return NextResponse.json(
      {
        error: "An active request already exists for this order item.",
        code: "ACTIVE_REQUEST_EXISTS",
      },
      { status: 409 },
    );
  }
  console.error("Unhandled API error", error);
  return NextResponse.json(
    { error: "An unexpected server error occurred.", code: "INTERNAL_ERROR" },
    { status: 500 },
  );
}

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}
