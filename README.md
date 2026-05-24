# Notes Frontend

Aplicacao web do sistema Hotel Mindu.

Este repositorio foi desenhado para operar com Supabase remoto.

## Contexto Rapido (para pessoas e LLMs)

- Dominio: gestao de hoteis e atividades.
- Arquitetura: modular por feature (`auth`, `hotels`) com separacao `data` e `ui`.
- Estado global: Pinia.
- Persistencia: Supabase (Auth + Postgres).
- Observacao importante: neste estado do projeto o frontend faz acesso direto ao Supabase para autenticacao e CRUD de hoteis.

## Stack

- Vue 3 (Composition API)
- TypeScript
- Vite
- Pinia
- Vue Router
- Tailwind CSS
- @supabase/supabase-js

## Estrutura de Diretorios

```text
src/
  core/
    utils/
      composables/
      types/
  shared/
    components/
    layouts/
  modules/
    auth/
      data/services/
      ui/components/
      ui/stores/
      ui/views/
    hotels/
      data/services/
      ui/stores/
      ui/views/
  router/
  assets/
  App.vue
  main.ts
```

## Arquivos-Chave

- `src/main.ts`: bootstrap da app e inicializacao do Pinia/router.
- `src/router/index.ts`: rotas e guards de autenticacao.
- `src/modules/auth/data/services/supabaseClient.ts`: cliente Supabase e validacao de env vars.
- `src/modules/auth/ui/stores/authStore.ts`: sessao/autenticacao.
- `src/modules/hotels/ui/stores/hotelStore.ts`: estado de hoteis.
- `src/modules/hotels/data/services/hotelService.ts`: CRUD de hoteis.
- `src/core/utils/types/index.ts`: tipos principais (`User`, `Hotel`, `Activity`).

## Variaveis de Ambiente

Crie `frontend/.env` (ou `.env.local`):

```bash
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key
```

Sem essas variaveis a aplicacao falha cedo por design.

## Comandos

```bash
npm install
npm run dev
npm run build
npm run preview
npm run type-check
```

## Rotas

- `/login` (guest only)
- `/register` (guest only)
- `/dashboard` (auth required)
- `/hotels` (auth required)

## Contratos Funcionais

### Auth

- Login: `supabase.auth.signInWithPassword`
- Registro: `supabase.auth.signUp`
- Logout: `supabase.auth.signOut`
- Recuperacao de senha: `supabase.auth.resetPasswordForEmail`

### Hoteis

- Tabela: `hotels`
- Operacoes: list, create, update, delete
- Campos relevantes: `id`, `name`, `description`, `status`, `archived`, `owner_id`, `created_at`, `updated_at`

## Decisoes de Arquitetura

- `core/`: utilitarios globais sem regra de negocio.
- `shared/`: componentes/layouts reutilizaveis sem dependencia forte de modulo.
- `modules/`: regra de negocio por dominio.
- Stores concentram estado e orquestracao de chamadas de servico.

## Limitacoes Conhecidas

- `authStore` monta um objeto de usuario simplificado apos login; se voce precisar de perfil completo, busque em tabela de perfis/usuarios.
- Ainda nao ha integracao no frontend com as Edge Functions do backend para hoteis/atividades.

## Guia de Evolucao (para LLM)

- Ao criar nova feature, seguir padrao `modules/<feature>/{data,ui}`.
- Evitar colocar regra de negocio em componentes visuais.
- Reusar tipos em `core/utils/types`.
- Preservar aliases `@/` e import absoluto.

## Troubleshooting

- Erro de modulo `@/...`: confirmar alias no `vite.config.ts` e `tsconfig.json`.
- Erro de auth: validar URL/key do Supabase remoto.
- Rotas redirecionando para login: checar estado em `authStore.checkAuth()`.
