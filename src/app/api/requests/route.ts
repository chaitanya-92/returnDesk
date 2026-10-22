import { NextRequest } from "next/server";
import { apiError, apiSuccess, AppError } from "@/lib/http";
import { requestDraftSchema } from "@/features/requests/schemas";
import { REQUEST_STATUSES } from "@/features/requests/types";
import { createRequest, listRequests } from "@/features/requests/service";

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const rawStatus = params.get("status")?.toUpperCase();
    const rawReason = params.get("reason")?.toUpperCase();
    const sortBy = params.get("sortBy") ?? "createdAt";
    const sortOrder = params.get("sortOrder") ?? "desc";
    const page = Number(params.get("page") ?? "1");
    const pageSize = Number(params.get("pageSize") ?? "10");
    if (rawStatus && !REQUEST_STATUSES.includes(rawStatus as (typeof REQUEST_STATUSES)[number])) {
      throw new AppError("Unknown request status filter.", 400, "INVALID_STATUS_FILTER");
    }
    if (rawReason && !["DAMAGED", "WRONG_ITEM", "WRONG_SIZE", "NOT_AS_DESCRIBED", "CHANGED_MIND", "MISSING_PARTS", "OTHER"].includes(rawReason)) {
      throw new AppError("Unknown request reason filter.", 400, "INVALID_REASON_FILTER");
    }
    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) {
      throw new AppError("Page must be positive and pageSize must be between 1 and 100.", 400, "INVALID_PAGINATION");
    }
    if (!["createdAt", "customerName", "status", "reason", "reference"].includes(sortBy) || !["asc", "desc"].includes(sortOrder)) {
      throw new AppError("Invalid sort field or direction.", 400, "INVALID_SORT");
    }
    const result = await listRequests({
      status: rawStatus as (typeof REQUEST_STATUSES)[number] | undefined,
      reason: rawReason ?? undefined,
      search: params.get("q") ?? undefined,
      sortBy: sortBy as "createdAt" | "customerName" | "status" | "reason" | "reference",
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
    const input = await requestDraftSchema.validate(body, { abortEarly: false, stripUnknown: true });
    const created = await createRequest(input);
    return apiSuccess(created, 201);
  } catch (error) {
    return apiError(error);
  }
}
