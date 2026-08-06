let pendingTarget: string | null = null;

export function scrollToSection(sectionId: string) {
  const el = document.getElementById(sectionId);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function requestScroll(sectionId: string) {
  pendingTarget = sectionId;
}

export function consumeScrollRequest() {
  const target = pendingTarget;
  pendingTarget = null;
  if (target && typeof document !== "undefined") {
    const el = document.getElementById(target);
    if (el) scrollToSection(target);
  }
}
