import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/investissements")({
  beforeLoad: () => {
    throw redirect({ to: "/finances" });
  },
});
