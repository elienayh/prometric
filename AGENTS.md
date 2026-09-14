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

## Workflow & Implantação (Cloudflare)
- O usuário baixa o ZIP gerado no AI Studio e realiza os commits/push localmente no repositório GitHub para manter a versão mais recente salva localmente.
- O ambiente de build no Cloudflare Pages/Workers utiliza **npm** (`npm run build`, `package-lock.json`).
- Nunca comitar ou gerar arquivos `bun.lock` ou `bun.lockb` para evitar conflitos de versão do Bun no Cloudflare.

