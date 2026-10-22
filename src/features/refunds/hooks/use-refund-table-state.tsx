"use client";

import { useState } from "react";
import type { RefundRequest, RefundSortField, RefundStatus, SortOrder } from "@/features/refunds/refund-utils";

const PAGE_SIZE = 10;

function getInitialStatusFilter(): RefundStatus {
  if (typeof window === "undefined") return "ALL";
  const status = new URLSearchParams(window.location.search).get("status");
  return status === "APPROVED" || status === "COMPLETED" ? status : "ALL";
}

export function useRefundTableState(filteredCount: number) {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<RefundStatus>(getInitialStatusFilter);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [confirmRefund, setConfirmRefund] = useState<RefundRequest | null>(null);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [sortBy, setSortBy] = useState<RefundSortField>("updatedAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const pageCount = Math.max(1, Math.ceil(filteredCount / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);

  const handleSort = (field: RefundSortField) => {
    if (sortBy === field) {
      setSortOrder((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortBy(field);
    setSortOrder(field === "updatedAt" ? "desc" : "asc");
  };

  const sortIndicator = (field: RefundSortField) => {
    if (sortBy !== field) return <span>↕</span>;
    return <span>{sortOrder === "asc" ? "↑" : "↓"}</span>;
  };

  return {
    page, setPage, pageCount, currentPage,
    statusFilter, setStatusFilter,
    actionMenuId, setActionMenuId,
    confirmRefund, setConfirmRefund,
    filterMenuOpen, setFilterMenuOpen,
    sortBy, sortOrder, handleSort, sortIndicator,
  };
}
