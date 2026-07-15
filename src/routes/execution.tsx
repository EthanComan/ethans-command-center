import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, X, Target, BookMarked, ShieldAlert } from "lucide-react";
import { DEFAULT_SESSION } from "@/modules/execution/data";

export const Route = createFileRoute("/execution")({
  head: () => ({
    meta: [
      { title: "Mode Execution — ETHAN" },
      { name: "description", content: "Environnement zero-distraction : mission, actions, ressources, chrono, protocoles." },
    ],
  }),
  component: ExecutionPage,
});

function ExecutionPage() {
  const session = DEFAULT_SESSION;
  const totalSec = session.durationMin * 60;
  const [left, setLeft] = useState(totalSec);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState<boolean[]>(() => session.actions.map(() => false));
  const intRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return;
    intRef.current = setInterval(() => {
      setLeft((s) => (s <= 1 ? (setRunning(false), 0) : s - 1));
    }, 1000);
    return () => { if (intRef.current) clearInterval(intRef.current); };
  }, [running]);

  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  const pct = ((totalSec - left) / totalSec) * 100;

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-background text-foreground">
      {/* Top bar — sortie uniquement */}
      <header className="flex items-center justify-between border-b border-border/60 px-6 py-3">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-gold">
          <Target className="h-3.5 w-3.5" /> Mode Execution
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-red-500/40 hover:text-red-300"
        >
          <X className="h-3.5 w-3.5" /> Quitter
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-10">
        {/* Mission */}
        <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Mission en cours</p>
        <h1 className="mt-2 text-2xl font-semibold leading-snug text-gold">{session.mission}</h1>

        {/* Chrono */}
        <div className="mt-8 rounded-2xl border border-gold/30 bg-gradient-to-b from-gold/[0.08] to-transparent p-8 text-center">
          <div className="font-mono text-7xl font-semibold tabular-nums tracking-tight text-gold">
            {mm}:{ss}
          </div>
          <div className="mx-auto mt-4 h-1 w-full max-w-md overflow-hidden rounded-full bg-border/40">
            <div className="h-full bg-gold transition-all" style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-6 flex justify-center gap-2">
            <button
              onClick={() => setRunning((r) => !r)}
              className="inline-flex items-center gap-2 rounded-md bg-gold px-4 py-2 text-sm font-semibold text-background transition-opacity hover:opacity-90"
            >
              {running ? <><Pause className="h-4 w-4" /> Pause</> : <><Play className="h-4 w-4" /> Demarrer</>}
            </button>
            <button
              onClick={() => { setRunning(false); setLeft(totalSec); }}
              className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm transition-colors hover:border-gold/40"
            >
              <RotateCcw className="h-4 w-4" /> Reset
            </button>
          </div>
        </div>

        {/* Actions */}
        <section className="mt-8">
          <h3 className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Actions necessaires</h3>
          <ul className="mt-3 space-y-2">
            {session.actions.map((a, i) => (
              <li key={i}>
                <label className="flex cursor-pointer items-start gap-3 rounded-md border border-border bg-elevated px-4 py-3 transition-colors hover:border-gold/40">
                  <input
                    type="checkbox"
                    checked={done[i]}
                    onChange={() => setDone((d) => d.map((v, j) => (j === i ? !v : v)))}
                    className="mt-0.5 h-4 w-4 accent-[color:var(--color-gold,#c9a24a)]"
                  />
                  <span className={done[i] ? "text-sm text-muted-foreground line-through" : "text-sm"}>{a}</span>
                </label>
              </li>
            ))}
          </ul>
        </section>

        {/* Ressources + Protocoles */}
        <section className="mt-8 grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-elevated p-5">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
              <BookMarked className="h-3.5 w-3.5" /> Ressources
            </div>
            <ul className="mt-3 space-y-2 text-[13px]">
              {session.resources.map((r) => (
                <li key={r.label}>
                  {r.href ? (
                    <Link to={r.href} className="text-foreground/90 hover:text-gold">→ {r.label}</Link>
                  ) : (
                    <span className="text-foreground/90">→ {r.label}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-border bg-elevated p-5">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
              <ShieldAlert className="h-3.5 w-3.5" /> Protocoles
            </div>
            <ul className="mt-3 space-y-2 text-[13px] text-foreground/90">
              {session.protocols.map((p) => (
                <li key={p}>· {p}</li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}