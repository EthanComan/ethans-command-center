import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/prospection")({
  beforeLoad: () => {
    throw redirect({ to: "/business" });
  },
});
