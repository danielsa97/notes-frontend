# Estrutura Refatorada do Frontend

## Nova Hierarquia

```
frontend/src
├── core/
│   └── utils/
│       ├── composables/
│       │   └── useLocalStorage.ts
│       ├── types/
│       │   └── index.ts
│       └── index.ts
├── shared/
│   ├── components/
│   │   ├── Card.vue
│   │   ├── Button.vue
│   │   ├── Input.vue
│   │   ├── Modal.vue
│   │   ├── Alert.vue
│   │   ├── Loading.vue
│   │   ├── FormGroup.vue
│   │   ├── Badge.vue
│   │   └── index.ts
│   ├── layouts/
│   │   ├── AppLayout.vue
│   │   └── index.ts
│   └── index.ts
├── modules/
│   ├── auth/
│   │   ├── data/
│   │   │   └── services/
│   │   │       ├── supabaseClient.ts
│   │   │       ├── authService.ts
│   │   │       └── index.ts
│   │   ├── ui/
│   │   │   ├── components/
│   │   │   │   ├── Header.vue
│   │   │   │   ├── Sidebar.vue
│   │   │   │   └── index.ts
│   │   │   ├── stores/
│   │   │   │   ├── authStore.ts
│   │   │   │   └── index.ts
│   │   │   └── views/
│   │   │       ├── HomePage.vue
│   │   │       ├── LoginPage.vue
│   │   │       └── RegisterPage.vue
│   │   └── index.ts
│   └── hotels/
│       ├── data/
│       │   └── services/
│       │       ├── hotelService.ts
│       │       └── index.ts
│       ├── ui/
│       │   ├── stores/
│       │   │   ├── hotelStore.ts
│       │   │   └── index.ts
│       │   └── views/
│       │       ├── DashboardPage.vue
│       │       └── HotelsPage.vue
│       └── index.ts
├── router/
│   └── index.ts
├── assets/
│   └── styles.css
├── App.vue
├── main.ts
└── index.ts
```

## Princípios da Estrutura

### 1. **Core**

- Contem utilitários compartilhados globalmente
- **utils/**: Composables, types e constantes reutilizáveis em toda a app

### 2. **Shared**

- Componentes e layouts que são utilizados em múltiplos módulos
- **components/**: Card, Button, Input, Modal, etc.
- **layouts/**: AppLayout (header + sidebar)

### 3. **Modules**

Cada módulo é independente e auto-contido com sua própria estrutura:

- **data/**: Camada de dados (services, API calls)
- **ui/**: Camada de apresentação (componentes, views, stores)

#### Auth Module

- Gerencia autenticação e autorização
- Responsável por login, registro, recuperação de senha
- Define o usuário logado

#### Hotels Module

- Gerencia os hotéis (CRUD)
- Dashboard do sistema
- Depende de autenticação

## Como Usar

### Importar de Core Utils

```typescript
// Types
import type { User, Hotel, Activity } from "@/core/utils/types";

// Composables
import useLocalStorage from "@/core/utils/composables/useLocalStorage";

// Ou atalho
import { useLocalStorage } from "@/core/utils";
```

### Importar de Shared

```typescript
// Componentes
import { Card, Button, Input } from "@/shared/components";
import AppLayout from "@/shared/layouts/AppLayout.vue";

// Ou atalho
import { Card, Button, AppLayout } from "@/shared";
```

### Importar de Módulos

```typescript
// Auth
import { useAuthStore } from "@/modules/auth/ui/stores";
import { authService } from "@/modules/auth/data/services";
import { Header } from "@/modules/auth/ui/components";

// Hotels
import { useHotelStore } from "@/modules/hotels/ui/stores";
import { hotelService } from "@/modules/hotels/data/services";
```

## Benefícios

✅ **Separação de Responsabilidades**: Cada pasta tem um propósito claro  
✅ **Modularidade**: Fácil adicionar novos módulos (ex: tickets, settings)  
✅ **Reutilização**: Componentes e utilitários compartilhados em um lugar  
✅ **Escalabilidade**: Estrutura pronta para crescimento  
✅ **Organização**: Código mais legível e fácil de navegar  
✅ **Testes**: Isolamento de código facilita unit tests

## Adicionando Novo Módulo

Para adicionar um novo módulo (ex: Tickets):

```
modules/tickets/
├── data/
│   └── services/
│       ├── ticketService.ts
│       └── index.ts
├── ui/
│   ├── components/
│   │   └── index.ts
│   ├── stores/
│   │   ├── ticketStore.ts
│   │   └── index.ts
│   └── views/
│       ├── TicketsPage.vue
│       └── TicketDetailPage.vue
└── index.ts
```

E exportar no `modules/tickets/index.ts`:

```typescript
export { useTicketStore } from "./ui/stores";
export * from "./data/services";
export * from "./ui/components";
```
