import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/partenaires")({
  beforeLoad: () => {
    throw redirect({ to: "/business" });
  },
});
