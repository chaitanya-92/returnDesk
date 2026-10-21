import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/http";
import { transitionSchema } from "@/features/requests/schemas";
import { transitionRequest } from "@/features/requests/service";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const input = transitionSchema.parse(await request.json());
    return apiSuccess(await transitionRequest(id, input));
  } catch (error) {
    return apiError(error);
  }
}
