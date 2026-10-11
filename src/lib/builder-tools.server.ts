import { tool } from "ai";
import { z } from "zod";

/**
 * Outils du Builder autonome : lit et modifie le code de l'application
 * directement dans le dépôt GitHub. Vercel republie automatiquement à
 * chaque commit (si la compilation échoue, l'ancienne version reste en ligne).
 */
export function createBuilderTools(token: string, repo: string, branch: string) {
  const api = async (path: string, init?: RequestInit) => {
    const res = await fetch(`https://api.github.com/repos/${repo}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "ethan-builder",
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) throw new Error(`GitHub ${res.status}: ${(await res.text()).slice(0, 300)}`);
    return res.json() as Promise<any>;
  };

  const decode = (b64: string) => {
    const bin = atob(b64.replace(/\n/g, ""));
    return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
  };

  return {
    list_files: tool({
      description: "Liste tous les fichiers du projet (chemins). À appeler en premier pour comprendre la structure.",
      inputSchema: z.object({ prefix: z.string().describe("Filtre de dossier, ex 'src/routes' ou '' pour tout") }),
      execute: async ({ prefix }) => {
        const t = await api(`/git/trees/${branch}?recursive=1`);
        return (t.tree as { path: string; type: string }[])
          .filter((f) => f.type === "blob" && f.path.startsWith(prefix) && !/^(android|ios|node_modules)\//.test(f.path))
          .map((f) => f.path)
          .slice(0, 800);
      },
    }),
    read_file: tool({
      description: "Lit le contenu complet d'un fichier du projet avant de le modifier.",
      inputSchema: z.object({ path: z.string() }),
      execute: async ({ path }) => {
        try {
          const f = await api(`/contents/${encodeURI(path)}?ref=${branch}`);
          return decode(f.content);
        } catch (e) {
          return `Fichier introuvable : ${path}`;
        }
      },
    }),
    write_files: tool({
      description:
        "Écrit (crée ou remplace intégralement) un ou plusieurs fichiers en un seul commit, puis l'application est republiée automatiquement. Toujours fournir le contenu COMPLET de chaque fichier. Pour supprimer un fichier, mettre delete à true.",
      inputSchema: z.object({
        message: z.string().describe("Résumé du changement en français"),
        files: z.array(z.object({ path: z.string(), content: z.string(), delete: z.boolean() })),
      }),
      execute: async ({ message, files }) => {
        const ref = await api(`/git/ref/heads/${branch}`);
        const parent = await api(`/git/commits/${ref.object.sha}`);
        const tree = await api(`/git/trees`, {
          method: "POST",
          body: JSON.stringify({
            base_tree: parent.tree.sha,
            tree: files.map((f) =>
              f.delete
                ? { path: f.path, mode: "100644", type: "blob", sha: null }
                : { path: f.path, mode: "100644", type: "blob", content: f.content },
            ),
          }),
        });
        const commit = await api(`/git/commits`, {
          method: "POST",
          body: JSON.stringify({ message: `[Builder] ${message}`, tree: tree.sha, parents: [ref.object.sha] }),
        });
        await api(`/git/refs/heads/${branch}`, { method: "PATCH", body: JSON.stringify({ sha: commit.sha }) });
        return { ok: true, commit: commit.sha.slice(0, 7), files: files.map((f) => f.path) };
      },
    }),
  };
}
