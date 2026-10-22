import {
  CheckCircle2,
  Clock3,
  Inbox,
  PackageCheck,
} from "lucide-react";

export const DASHBOARD_METRIC_CARDS = [
  {
    id: "open",
    label: "Open requests",
    metricKey: "open",
    helper: "Waiting to be reviewed",
    icon: Inbox,
    href: "/requests?status=OPEN",
  },
  {
    id: "in-review",
    label: "In review",
    metricKey: "inReview",
    helper: "Needs an operational decision",
    icon: Clock3,
    href: "/requests?status=IN_REVIEW",
  },
  {
    id: "approved",
    label: "Approved",
    metricKey: "approved",
    helper: "Ready to be fulfilled",
    icon: PackageCheck,
    href: "/requests?status=APPROVED",
  },
  {
    id: "completed",
    label: "Completed",
    metricKey: "completed",
    helper: "Successfully resolved",
    icon: CheckCircle2,
    href: "/requests?status=COMPLETED",
  },
] as const;
