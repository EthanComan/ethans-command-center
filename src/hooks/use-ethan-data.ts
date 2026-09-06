/**
 * Pont client ⇄ données réelles.
 * Une seule porte d'entrée pour lire et écrire dans les tables de l'utilisateur.
 */
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import {
  deleteRow,
  insertRow,
  listRows,
  updateRow,
  type Cell,
  type Row,
  type TableName,
} from "@/lib/data.functions";

export type { Row, Cell, TableName };

export function useAuthed() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) setAuthed(Boolean(data.session));
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      setAuthed(Boolean(session)),
    );
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);
  return authed;
}

interface ListOptions {
  orderBy?: string;
  ascending?: boolean;
  filters?: { column: string; value: string | number | boolean | null }[];
}

export function useRows<T extends Row = Row>(table: TableName, options: ListOptions = {}) {
  const authed = useAuthed();
  const fetchRows = useServerFn(listRows);
  const query = useQuery({
    queryKey: ["rows", table, options],
    queryFn: () =>
      fetchRows({
        data: {
          table,
          orderBy: options.orderBy ?? "created_at",
          ascending: options.ascending ?? false,
          filters: options.filters ?? [],
          limit: 500,
        },
      }),
    enabled: authed === true,
    retry: false,
  });
  return {
    ...query,
    authed,
    rows: (query.data ?? []) as T[],
  };
}

export function useRowMutations(table: TableName) {
  const qc = useQueryClient();
  const add = useServerFn(insertRow);
  const edit = useServerFn(updateRow);
  const remove = useServerFn(deleteRow);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["rows"] });
  const onError = (e: unknown) =>
    toast.error(e instanceof Error ? e.message : "Enregistrement impossible");

  const create = useMutation({
    mutationFn: (values: Record<string, Cell>) => add({ data: { table, values } }),
    onSuccess: () => {
      invalidate();
      toast.success("Enregistré");
    },
    onError,
  });

  const update = useMutation({
    mutationFn: (input: { id: string; values: Record<string, Cell> }) =>
      edit({ data: { table, id: input.id, values: input.values } }),
    onSuccess: invalidate,
    onError,
  });

  const destroy = useMutation({
    mutationFn: (id: string) => remove({ data: { table, id } }),
    onSuccess: () => {
      invalidate();
      toast.success("Supprimé");
    },
    onError,
  });

  return { create, update, destroy };
}
