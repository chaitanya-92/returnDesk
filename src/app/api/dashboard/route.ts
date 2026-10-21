import { RequestEventType, RequestStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/http";

const reasonLabels: Record<string, string> = {
  DAMAGED: "Damaged",
  WRONG_SIZE: "Wrong size",
  CHANGED_MIND: "Changed mind",
  MISSING_PARTS: "Missing parts",
  NOT_AS_DESCRIBED: "Not as described",
  WRONG_ITEM: "Wrong item",
};

const statusList: RequestStatus[] = ["OPEN", "IN_REVIEW", "APPROVED", "REJECTED", "COMPLETED"];

export async function GET() {
  try {
    const now = new Date();
    const sixWeeksAgo = new Date(now);
    sixWeeksAgo.setDate(now.getDate() - 41);
    sixWeeksAgo.setHours(0, 0, 0, 0);

    const [statusGroups, reasonGroups, recent, pending, trendRequests, closedRequests, total] = await Promise.all([
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
        take: 6,
        select: {
          id: true, reference: true, customerName: true, itemName: true,
          reason: true, status: true, createdAt: true,
        },
      }),
      prisma.returnRequest.findMany({
        where: { archivedAt: null, status: "IN_REVIEW" },
        orderBy: { createdAt: "asc" },
        take: 5,
        select: {
          id: true, reference: true, customerName: true, itemName: true,
          reason: true, createdAt: true,
        },
      }),
      prisma.returnRequest.findMany({
        where: { archivedAt: null, createdAt: { gte: sixWeeksAgo } },
        select: { createdAt: true },
      }),
      prisma.returnRequest.findMany({
        where: { archivedAt: null, status: { in: ["COMPLETED", "REJECTED"] } },
        select: {
          createdAt: true,
          events: {
            where: {
              type: RequestEventType.STATUS_CHANGED,
              toStatus: { in: ["COMPLETED", "REJECTED"] },
            },
            orderBy: { createdAt: "asc" },
            take: 1,
            select: { createdAt: true },
          },
        },
      }),
      prisma.returnRequest.count({ where: { archivedAt: null } }),
    ]);

    const counts = Object.fromEntries(statusList.map((status) => [status, 0])) as Record<RequestStatus, number>;
    for (const group of statusGroups) counts[group.status] = group._count._all;

    const reasons = reasonGroups.map((group) => ({
      key: group.reason,
      label: reasonLabels[group.reason] ?? group.reason.replaceAll("_", " ").toLowerCase(),
      count: group._count._all,
    }));

    const weeks = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(sixWeeksAgo);
      date.setDate(sixWeeksAgo.getDate() + index * 7);
      return { start: date, label: date.toLocaleDateString("en-IN", { day: "numeric", month: "short" }), count: 0 };
    });
    for (const request of trendRequests) {
      const daysSinceStart = Math.floor((request.createdAt.getTime() - sixWeeksAgo.getTime()) / 86_400_000);
      const index = Math.min(5, Math.max(0, Math.floor(daysSinceStart / 7)));
      if (weeks[index]) weeks[index].count += 1;
    }

    const resolutionDurations = closedRequests.flatMap((request) => {
      const terminalEvent = request.events[0];
      if (!terminalEvent) return [];
      const days = (terminalEvent.createdAt.getTime() - request.createdAt.getTime()) / 86_400_000;
      return days >= 0 ? [days] : [];
    });
    const averageResolutionDays = resolutionDurations.length
      ? resolutionDurations.reduce((sum, value) => sum + value, 0) / resolutionDurations.length
      : null;

    return NextResponse.json({
      data: {
        counts: {
          total,
          open: counts.OPEN,
          inReview: counts.IN_REVIEW,
          approved: counts.APPROVED,
          rejected: counts.REJECTED,
          completed: counts.COMPLETED,
          active: counts.OPEN + counts.IN_REVIEW + counts.APPROVED,
        },
        reasons: reasons.slice(0, 6),
        recent,
        pending,
        weeklyTrend: weeks.map(({ label, count }) => ({ label, count })),
        resolutionPerformance: {
          averageDays: averageResolutionDays === null ? null : Math.round(averageResolutionDays * 10) / 10,
          closedCount: resolutionDurations.length,
          periodLabel: "All recorded terminal status changes",
        },
      },
    });
  } catch (error) {
    return apiError(error);
  }
}
