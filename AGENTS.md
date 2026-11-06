<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Chat requests must carry a verified user bearer token; privileged Builder writes additionally require the server-configured owner UUID to prevent other accounts modifying the repository.
- Use the native Google SDK for direct Gemini tool calls and a shared authenticated transport for both chats; this preserves tool signatures and keeps provider keys server-only.
