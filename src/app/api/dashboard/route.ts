import { NextResponse } from "next/server";
import { RequestEventType, RequestStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/http";

export const dynamic = "force-dynamic";

const terminalStatuses: RequestStatus[] = [
  RequestStatus.COMPLETED,
  RequestStatus.REJECTED,
];

export async function GET() {
  try {
    const [
      statusGroups,
      reasonGroups,
      recent,
      pendingApprovals,
      resolutionEvents,
      totalPreviousPeriod,
      totalCurrentPeriod,
    ] = await Promise.all([
      prisma.returnRequest.groupBy({
        by: ["status"],
        where: { archivedAt: null },
        _count: { _all: true },
      }),
      prisma.returnRequest.groupBy({
        by: ["reason"],
        where: { archivedAt: null },
        _count: { _all: true },
        orderBy: { _count: { reason: "desc" } },
      }),
      prisma.returnRequest.findMany({
        where: { archivedAt: null },
        orderBy: { createdAt: "desc" },
        take: 8,
        select: {
          id: true,
          reference: true,
          orderNumber: true,
          itemName: true,
          customerName: true,
          customerEmail: true,
          reason: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.returnRequest.findMany({
        where: { archivedAt: null, status: RequestStatus.IN_REVIEW },
        orderBy: { createdAt: "asc" },
        take: 5,
        select: {
          id: true,
          reference: true,
          itemName: true,
          customerName: true,
          reason: true,
          createdAt: true,
        },
      }),
      prisma.requestEvent.findMany({
        where: {
          type: RequestEventType.STATUS_CHANGED,
          toStatus: { in: terminalStatuses },
        },
        orderBy: { createdAt: "desc" },
        take: 500,
        select: {
          requestId: true,
          createdAt: true,
          request: { select: { createdAt: true } },
        },
      }),
      prisma.returnRequest.count({
        where: {
          archivedAt: null,
          createdAt: {
            gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
            lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      prisma.returnRequest.count({
        where: {
          archivedAt: null,
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      }),
    ]);

    const counts = Object.fromEntries(
      statusGroups.map((group) => [group.status, group._count._all]),
    ) as Record<string, number>;
    const durations = resolutionEvents.map(
      (event) =>
        Math.max(
          0,
          event.createdAt.getTime() - event.request.createdAt.getTime(),
        ) / 3_600_000,
    );
    const averageResolutionHours = durations.length
      ? Math.round(
          (durations.reduce((sum, value) => sum + value, 0) /
            durations.length) *
            10,
        ) / 10
      : null;

    const reasons = reasonGroups.map((group) => ({
      reason: group.reason
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(/^\\w/, (letter) => letter.toUpperCase()),
      count: group._count._all,
    }));

    return NextResponse.json(
      {
        data: {
          metrics: {
            total: Object.values(counts).reduce((sum, value) => sum + value, 0),
            open: counts.OPEN ?? 0,
            inReview: counts.IN_REVIEW ?? 0,
            approved: counts.APPROVED ?? 0,
            rejected: counts.REJECTED ?? 0,
            completed: counts.COMPLETED ?? 0,
            previous30Days: totalPreviousPeriod,
            current30Days: totalCurrentPeriod,
            averageResolutionHours,
            resolvedCount: durations.length,
          },
          reasons,
          pendingApprovals,
          recent,
          resolutionHistory: resolutionEvents.slice(0, 30).map((event) => ({
            date: event.createdAt.toISOString(),
            hours:
              Math.round(
                (Math.max(
                  0,
                  event.createdAt.getTime() - event.request.createdAt.getTime(),
                ) /
                  3_600_000) *
                  10,
              ) / 10,
          })),
        },
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return apiError(error);
  }
}
