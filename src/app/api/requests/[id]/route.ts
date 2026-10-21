import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/http";
import { requestDetailsUpdateSchema } from "@/features/requests/schemas";
import { archiveRequest, getRequest, updateRequestDetails } from "@/features/requests/service";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    return apiSuccess(await getRequest(id));
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const input = await requestDetailsUpdateSchema.validate(await request.json(), { abortEarly: false, stripUnknown: true });
    return apiSuccess(await updateRequestDetails(id, input));
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    return apiSuccess(await archiveRequest(id));
  } catch (error) {
    return apiError(error);
  }
}
