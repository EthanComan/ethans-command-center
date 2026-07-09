import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";
import { getModuleByPath, MODULE_CATEGORIES } from "@/config/modules";

export const Route = createFileRoute("/partenaires")({
  component: PartenairesPage,
});

function PartenairesPage() {
  const mod = getModuleByPath("/partenaires")!;
  const category = MODULE_CATEGORIES.find((c) => c.modules.some((m) => m.id === mod.id))?.label;
  return <ComingSoon title={mod.label} description={mod.description} icon={mod.icon} category={category} />;
}
