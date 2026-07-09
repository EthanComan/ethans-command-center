import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";
import { getModuleByPath, MODULE_CATEGORIES } from "@/config/modules";

export const Route = createFileRoute("/habitudes")({
  component: HabitudesPage,
});

function HabitudesPage() {
  const mod = getModuleByPath("/habitudes")!;
  const category = MODULE_CATEGORIES.find((c) => c.modules.some((m) => m.id === mod.id))?.label;
  return <ComingSoon title={mod.label} description={mod.description} icon={mod.icon} category={category} />;
}
