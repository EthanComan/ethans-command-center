import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/sante")({
  beforeLoad: () => {
    throw redirect({ to: "/performance" });
  },
});
