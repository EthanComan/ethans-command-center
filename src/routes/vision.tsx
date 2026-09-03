import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/vision")({
  beforeLoad: () => {
    throw redirect({ to: "/objectifs" });
  },
});
