"use client";

export function AdminHeaderAlerts() {
  return (
    <div className="flex items-center gap-4 md:gap-6">
      <div className="hidden items-center gap-2 rounded-full border border-emerald-500/10 bg-emerald-500/10 px-3 py-1.5 md:flex">
        <span className="material-symbols-outlined text-sm text-emerald-600">verified_user</span>
        <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-700">Session securisee</span>
      </div>
      <div className="hidden items-center gap-2 rounded-full border border-orange-500/10 bg-orange-500/10 px-3 py-1.5 md:flex">
        <span className="material-symbols-outlined text-sm text-orange-500">lan</span>
        <span className="text-[9px] font-bold uppercase tracking-widest text-orange-600">Backend connecte</span>
      </div>
    </div>
  );
}
