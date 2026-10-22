import { NextRequest } from "next/server";
import { apiError, apiSuccess, AppError } from "@/lib/http";
import { requestDraftSchema } from "@/features/requests/schemas";
import { REQUEST_STATUSES } from "@/features/requests/types";
import { createRequest, listRequests } from "@/features/requests/service";

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const rawStatuses = params.getAll("status").map((value) => value.toUpperCase());
    const rawReasons = params.getAll("reason").map((value) => value.toUpperCase());
    const rawResolution = params.get("resolution")?.toUpperCase();
    const sortBy = params.get("sortBy") ?? "createdAt";
    const sortOrder = params.get("sortOrder") ?? "desc";
    const rawDate = params.get("date");
    if (rawDate && !/^\d{4}-\d{2}-\d{2}$/.test(rawDate))
      throw new AppError(
        "Date must use YYYY-MM-DD format.",
        400,
        "INVALID_DATE_FILTER",
      );
    const date = rawDate ? new Date(`${rawDate}T00:00:00.000Z`) : undefined;
    if (date && Number.isNaN(date.getTime()))
      throw new AppError("Invalid date filter.", 400, "INVALID_DATE_FILTER");
    const page = Number(params.get("page") ?? "1");
    const pageSize = Number(params.get("pageSize") ?? "10");
    if (
      rawStatuses.some((value) => !REQUEST_STATUSES.includes(value as (typeof REQUEST_STATUSES)[number]))
    ) {
      throw new AppError(
        "Unknown request status filter.",
        400,
        "INVALID_STATUS_FILTER",
      );
    }
    if (
      rawReasons.some((value) => !["DAMAGED", "WRONG_ITEM", "WRONG_SIZE", "NOT_AS_DESCRIBED", "CHANGED_MIND", "MISSING_PARTS", "OTHER"].includes(value))
    ) {
      throw new AppError(
        "Unknown request reason filter.",
        400,
        "INVALID_REASON_FILTER",
      );
    }
    if (
      !Number.isInteger(page) ||
      page < 1 ||
      !Number.isInteger(pageSize) ||
      pageSize < 1 ||
      pageSize > 100
    ) {
      throw new AppError(
        "Page must be positive and pageSize must be between 1 and 100.",
        400,
        "INVALID_PAGINATION",
      );
    }
    if (
      !["createdAt", "customerName", "status", "reason", "reference"].includes(
        sortBy,
      ) ||
      !["asc", "desc"].includes(sortOrder)
    ) {
      throw new AppError(
        "Invalid sort field or direction.",
        400,
        "INVALID_SORT",
      );
    }
    const result = await listRequests({
      statuses: rawStatuses as (typeof REQUEST_STATUSES)[number][],
      resolution: rawResolution as "REFUND" | "STORE_CREDIT" | "REPLACEMENT" | undefined,
      reasons: rawReasons,
      createdDate: date,
      search: params.get("q") ?? undefined,
      sortBy: sortBy as
        "createdAt" | "customerName" | "status" | "reason" | "reference",
      sortOrder: sortOrder as "asc" | "desc",
      page,
      pageSize,
    });
    return apiSuccess(result);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const input = await requestDraftSchema.validate(body, {
      abortEarly: false,
      stripUnknown: true,
    });
    const created = await createRequest(input);
    return apiSuccess(created, 201);
  } catch (error) {
    return apiError(error);
  }
}
