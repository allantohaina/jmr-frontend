"use client";

import { Award } from "lucide-react";

const PRIVILEGE_REVENUE_THRESHOLD = 500000;

export function PrivilegeBadge({
  isPrivileged,
  cumulativeRevenue,
  className = "",
}: {
  isPrivileged?: boolean;
  cumulativeRevenue?: number;
  className?: string;
}) {
  const isAuto = !isPrivileged && (cumulativeRevenue ?? 0) >= PRIVILEGE_REVENUE_THRESHOLD;
  const show = isPrivileged || isAuto;

  if (!show) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 text-[8px] font-bold uppercase tracking-widest rounded-full shrink-0 ${className}`}
    >
      <Award className="h-2.5 w-2.5" />
      privilégié
      {isAuto && <span className="ml-0.5 text-amber-500">(auto)</span>}
    </span>
  );
}
