import { Badge } from "@/components/ui/badge";
import type { BookingStatus, Congestion, GrievanceStatus, PaymentStatus, ProcurementStatus } from "@/lib/types";

export function congestionTone(c: Congestion) {
  return c === "low" ? "good" : c === "medium" ? "warn" : "bad";
}

export function congestionLabel(c: Congestion) {
  return c === "low" ? "Low congestion" : c === "medium" ? "Moderate congestion" : "High congestion";
}

export function BookingBadge({ status }: { status: BookingStatus }) {
  const tone = status === "Confirmed" ? "info" : status === "Completed" ? "good" : status === "Cancelled" ? "bad" : "warn";
  return <Badge tone={tone}>{status}</Badge>;
}

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  const tone = status === "Paid" ? "good" : status === "Processing" ? "info" : "bad";
  return <Badge tone={tone}>{status}</Badge>;
}

export function ProcBadge({ status }: { status: ProcurementStatus }) {
  const tone =
    status === "Paid"
      ? "good"
      : status === "Payment Pending"
        ? "warn"
        : status === "Approved"
          ? "info"
          : "neutral";
  return <Badge tone={tone}>{status}</Badge>;
}

export function GrievanceBadge({ status }: { status: GrievanceStatus }) {
  const tone =
    status === "Resolved" ? "good" : status === "Escalated" ? "bad" : status === "In Progress" ? "info" : "warn";
  return <Badge tone={tone}>{status}</Badge>;
}
