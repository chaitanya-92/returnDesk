import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/http";
import { noteSchema } from "@/features/requests/schemas";
import { addNote, getRequest } from "@/features/requests/service";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const input = noteSchema.parse(await request.json());
    await getRequest(id);
    return apiSuccess(await addNote(id, input.body, input.author), 201);
  } catch (error) {
    return apiError(error);
  }
}
