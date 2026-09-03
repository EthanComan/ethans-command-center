import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/bibliotheque")({
  beforeLoad: () => {
    throw redirect({ to: "/protocoles" });
  },
});
