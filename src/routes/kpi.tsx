import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/kpi")({
  beforeLoad: () => {
    throw redirect({ to: "/business" });
  },
});
