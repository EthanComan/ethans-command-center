import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";
import { getModuleByPath, MODULE_CATEGORIES } from "@/config/modules";

export const Route = createFileRoute("/ia")({
  component: IaPage,
});

function IaPage() {
  const mod = getModuleByPath("/ia")!;
  const category = MODULE_CATEGORIES.find((c) => c.modules.some((m) => m.id === mod.id))?.label;
  return <ComingSoon title={mod.label} description={mod.description} icon={mod.icon} category={category} />;
}
