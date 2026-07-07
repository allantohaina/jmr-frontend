"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  parseCurrentProjectStep,
  parseProjectTrackingView,
  ProjectTrackingSection,
} from "@/app/components/project-tracking-section";

function SuiviProjetPageContent() {
  const searchParams = useSearchParams();
  const step = searchParams.get("step") ?? undefined;
  const view = searchParams.get("view") ?? undefined;
  const currentStep = parseCurrentProjectStep(step);
  const currentView = parseProjectTrackingView(view, step);

  return <ProjectTrackingSection currentStep={currentStep} view={currentView} />;
}

export default function SuiviProjetPage() {
  return (
    <Suspense>
      <SuiviProjetPageContent />
    </Suspense>
  );
}
