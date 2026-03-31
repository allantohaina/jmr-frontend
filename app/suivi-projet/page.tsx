import {
  parseCurrentProjectStep,
  parseProjectTrackingView,
  ProjectTrackingSection,
  type ProjectStepSearchParam,
  type ProjectTrackingViewSearchParam,
} from "@/app/components";

export default async function SuiviProjetPage({
  searchParams,
}: {
  searchParams: Promise<{
    step?: ProjectStepSearchParam;
    view?: ProjectTrackingViewSearchParam;
  }>;
}) {
  const { step, view } = await searchParams;
  const currentStep = parseCurrentProjectStep(step);
  const currentView = parseProjectTrackingView(view, step);

  return <ProjectTrackingSection currentStep={currentStep} view={currentView} />;
}
