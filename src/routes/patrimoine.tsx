import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/patrimoine")({
  beforeLoad: () => {
    throw redirect({ to: "/finances" });
  },
});
