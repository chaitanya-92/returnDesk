import { NextRequest } from "next/server";
import { apiError, apiSuccess, AppError } from "@/lib/http";
import { requestDraftSchema } from "@/features/requests/schemas";
import { REQUEST_STATUSES } from "@/features/requests/types";
import { createRequest, listRequests } from "@/features/requests/service";

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const rawStatus = params.get("status")?.toUpperCase();
    if (rawStatus && !REQUEST_STATUSES.includes(rawStatus as (typeof REQUEST_STATUSES)[number])) {
      throw new AppError("Unknown request status filter.", 400, "INVALID_STATUS_FILTER");
    }
    const requests = await listRequests({
      status: rawStatus as (typeof REQUEST_STATUSES)[number] | undefined,
      search: params.get("q") ?? undefined,
    });
    return apiSuccess(requests);
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
