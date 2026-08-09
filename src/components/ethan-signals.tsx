/**
 * "ETHAN vient vers moi" — bandeau de sollicitations.
 * Ne s'affiche que si une intervention est réellement nécessaire.
 */
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listItems } from "@/lib/ethan.functions";
import { ATTENTION_META, interventions, solicitations } from "@/brain/vigilance";

export function EthanSignals() {
  const fetchItems = useServerFn(listItems);
  const { data } = useQuery({
    queryKey: ["ethan", "items"],
    queryFn: () => fetchItems(),
    retry: false,
  });

  const list = solicitations(interventions(data ?? [])).slice(0, 3);
  if (list.length === 0) return null;

  return (
    <section className="mt-6 rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-[0.24em] text-gold">ETHAN te signale</p>
        <Link to="/suivi" className="text-xs text-muted-foreground hover:text-foreground">
          Tout le suivi
        </Link>
      </div>
      <ul className="mt-3 space-y-3">
        {list.map((i) => (
          <li key={i.itemId} className="border-l-2 pl-3" style={{ borderColor: "currentColor" }}>
            <p className={`text-[11px] uppercase tracking-wider ${ATTENTION_META[i.attention].tone}`}>
              {ATTENTION_META[i.attention].label}
            </p>
            <p className="text-sm font-medium text-foreground">{i.title}</p>
            <p className="text-sm text-muted-foreground">{i.nextAction}</p>
            <p className="text-xs text-muted-foreground/80">{i.why}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}