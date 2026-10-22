import { Prisma, RequestEventType, RequestStatus } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/http";
import { ACTIVE_STATUSES, ALLOWED_TRANSITIONS, type RequestDetailsUpdate, type RequestDraft, type RequestResolution } from "./types";
import type { RequestTransitionInput } from "./schemas";

const liveFilter = { archivedAt: null } as const;

function nextReference() {
  const day = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const suffix = randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase();
  return `RT-${day}-${suffix}`;
}

function validateResolution(input: RequestResolution) {
  if (!input.resolution) {
    throw new AppError("A resolution is required for approval.", 400, "RESOLUTION_REQUIRED");
  }

  if (input.resolution === "REFUND") {
    if (input.refundAmount == null || !Number.isFinite(input.refundAmount) || input.refundAmount <= 0) {
      throw new AppError("A refund requires a positive refund amount.", 400, "REFUND_AMOUNT_REQUIRED");
    }
  } else if (input.refundAmount != null) {
    throw new AppError("Refund amount is only allowed for the Refund resolution.", 400, "REFUND_AMOUNT_NOT_ALLOWED");
  }
}

export type RequestListFilters = {
  status?: RequestStatus;
  reason?: string;
  search?: string;
  sortBy?: "createdAt" | "customerName" | "status" | "reason" | "reference";
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
};

export async function listRequests(filters?: RequestListFilters) {
  const search = filters?.search?.trim();
  const page = Math.max(1, filters?.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, filters?.pageSize ?? 10));
  const sortBy = filters?.sortBy ?? "createdAt";
  const sortOrder = filters?.sortOrder ?? "desc";
  const where: Prisma.ReturnRequestWhereInput = {
    ...liveFilter,
    ...(filters?.status ? { status: filters.status } : {}),
    ...(filters?.reason ? { reason: filters.reason } : {}),
    ...(search ? { OR: [
      { reference: { contains: search, mode: "insensitive" } },
      { orderNumber: { contains: search, mode: "insensitive" } },
      { customerName: { contains: search, mode: "insensitive" } },
      { customerEmail: { contains: search, mode: "insensitive" } },
    ] } : {}),
  };
  const [items, total] = await prisma.$transaction([
    prisma.returnRequest.findMany({
      where,
      include: { notes: { orderBy: { createdAt: "asc" } }, events: { orderBy: { createdAt: "asc" } } },
      orderBy: [{ [sortBy]: sortOrder }, { id: "asc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.returnRequest.count({ where }),
  ]);
  return { items, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getRequest(id: string) {
  const request = await prisma.returnRequest.findFirst({
    where: { id, ...liveFilter },
    include: { notes: { orderBy: { createdAt: "asc" } }, events: { orderBy: { createdAt: "asc" } } },
  });
  if (!request) throw new AppError("Return request not found.", 404, "REQUEST_NOT_FOUND");
  return request;
}

export async function createRequest(input: RequestDraft) {
  return prisma.$transaction(async (tx) => {
    const active = await tx.returnRequest.findFirst({
      where: { orderNumber: input.orderNumber, orderItemId: input.orderItemId, archivedAt: null, status: { in: ACTIVE_STATUSES } },
      select: { id: true },
    });
    if (active) throw new AppError("An active request already exists for this order item.", 409, "ACTIVE_REQUEST_EXISTS");

    return tx.returnRequest.create({
      data: {
        ...input,
        reference: nextReference(),
        events: { create: { type: RequestEventType.CREATED, message: "Request created." } },
      },
      include: { notes: true, events: true },
    });
  });
}

export async function updateRequestDetails(id: string, input: RequestDetailsUpdate) {
  const existing = await prisma.returnRequest.findFirst({ where: { id, ...liveFilter } });
  if (!existing) throw new AppError("Return request not found.", 404, "REQUEST_NOT_FOUND");
  if (["APPROVED", "REJECTED", "COMPLETED"].includes(existing.status)) {
    throw new AppError("Request details cannot be edited after approval, rejection, or completion.", 409, "REQUEST_DETAILS_LOCKED");
  }

  return prisma.$transaction(async (tx) => {
    await tx.returnRequest.update({ where: { id }, data: input });
    await tx.requestEvent.create({ data: { requestId: id, type: RequestEventType.DETAILS_UPDATED, message: "Request details updated." } });
    return tx.returnRequest.findUniqueOrThrow({ where: { id }, include: { notes: { orderBy: { createdAt: "asc" } }, events: { orderBy: { createdAt: "asc" } } } });
  });
}

export async function transitionRequest(id: string, input: RequestTransitionInput) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.returnRequest.findFirst({ where: { id, ...liveFilter } });
    if (!existing) throw new AppError("Return request not found.", 404, "REQUEST_NOT_FOUND");

    if (!(ALLOWED_TRANSITIONS[existing.status as keyof typeof ALLOWED_TRANSITIONS] as RequestStatus[]).includes(input.status as RequestStatus)) {
      throw new AppError(`Transition from ${existing.status.replaceAll("_", " ")} to ${input.status.replaceAll("_", " ")} is not allowed.`, 409, "INVALID_STATUS_TRANSITION");
    }

    const resolutionInput = input.status === "APPROVED"
      ? { resolution: input.resolution, refundAmount: input.refundAmount ?? null }
      : null;
    if (resolutionInput) validateResolution(resolutionInput);

    const updateData: Prisma.ReturnRequestUpdateInput = { status: input.status };
    if (input.status === "APPROVED" && resolutionInput) {
      updateData.resolution = resolutionInput.resolution;
      updateData.refundAmount = resolutionInput.refundAmount == null ? null : new Prisma.Decimal(resolutionInput.refundAmount);
    }
    await tx.returnRequest.update({ where: { id }, data: updateData });
    await tx.requestEvent.create({
      data: { requestId: id, type: RequestEventType.STATUS_CHANGED, fromStatus: existing.status, toStatus: input.status, message: `Status changed from ${existing.status} to ${input.status}.` },
    });

    if ("note" in input && input.note?.trim()) {
      await tx.requestNote.create({ data: { requestId: id, body: input.note.trim(), author: "Operations team" } });
      await tx.requestEvent.create({ data: { requestId: id, type: RequestEventType.NOTE_ADDED, message: "A note was added during status change." } });
    }
    return tx.returnRequest.findUniqueOrThrow({ where: { id }, include: { notes: { orderBy: { createdAt: "asc" } }, events: { orderBy: { createdAt: "asc" } } } });
  });
}

export async function addNote(id: string, body: string, author: string) {
  return prisma.$transaction(async (tx) => {
    const request = await tx.returnRequest.findFirst({ where: { id, ...liveFilter }, select: { id: true } });
    if (!request) throw new AppError("Return request not found.", 404, "REQUEST_NOT_FOUND");
    const note = await tx.requestNote.create({ data: { requestId: id, body, author } });
    await tx.requestEvent.create({ data: { requestId: id, type: RequestEventType.NOTE_ADDED, message: "A note was added." } });
    return note;
  });
}

export async function archiveRequest(id: string) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.returnRequest.findFirst({ where: { id, ...liveFilter } });
    if (!existing) throw new AppError("Return request not found.", 404, "REQUEST_NOT_FOUND");
    if (!["OPEN", "REJECTED"].includes(existing.status)) {
      throw new AppError("Only Open or Rejected requests can be removed.", 409, "REQUEST_CANNOT_BE_ARCHIVED");
    }
    await tx.returnRequest.update({ where: { id }, data: { archivedAt: new Date() } });
    await tx.requestEvent.create({ data: { requestId: id, type: RequestEventType.ARCHIVED, message: "Request archived; original record retained." } });
    return { id, archived: true };
  });
}
