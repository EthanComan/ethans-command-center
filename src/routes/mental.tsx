import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/mental")({
  beforeLoad: () => {
    throw redirect({ to: "/performance" });
  },
});
