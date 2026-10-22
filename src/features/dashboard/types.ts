export type RequestStatus = "OPEN" | "IN_REVIEW" | "APPROVED" | "REJECTED" | "COMPLETED";

export type DashboardRequestRow = {
  id: string;
  reference: string;
  orderNumber: string;
  itemName: string;
  customerName: string;
  customerEmail: string;
  reason: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
};

export type PendingApprovalRow = Pick<
  DashboardRequestRow,
  "id" | "reference" | "itemName" | "customerName" | "reason" | "createdAt"
>;

export type DashboardMetrics = {
  total: number;
  open: number;
  inReview: number;
  approved: number;
  rejected: number;
  completed: number;
  previous30Days: number;
  current30Days: number;
  averageResolutionHours: number | null;
  resolvedCount: number;
};

export type DashboardData = {
  metrics: DashboardMetrics;
  reasons: Array<{ reason: string; count: number }>;
  pendingApprovals: PendingApprovalRow[];
  recent: DashboardRequestRow[];
  resolutionHistory: Array<{ date: string; hours: number }>;
};
