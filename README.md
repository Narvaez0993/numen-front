# front-numen

App móvil de **numen** (gestor personal de gastos). React Native + Expo + arquitectura DDD.

## Stack

- **Expo SDK 54** (RN 0.81, React 19, New Architecture habilitada)
- **TypeScript** estricto (`strict` + `noUncheckedIndexedAccess`)
- **Expo Router v4** (file-based routing en `app/`)
- **Zustand** (estado de cliente) + **TanStack Query v5** (estado de servidor)
- **React Hook Form + Zod** (forms + validación)
- **Axios** (HTTP con interceptores para auth)
- **i18next + expo-localization** (español default, multi-idioma listo)
- **StyleSheet API** + design tokens centralizados
- **Jest + Testing Library** (unit tests)
- **ESLint + eslint-plugin-boundaries** (enforce DDD layers)
- **Husky + lint-staged + commitlint** (Conventional Commits)

## Scripts

```bash
npm start            # Expo dev server
npm run ios          # iOS simulator
npm run android      # Android emulator
npm run web          # Web

npm run lint         # ESLint (incluye reglas DDD)
npm run lint:fix
npm run format       # Prettier
npm run typecheck    # tsc --noEmit
npm test             # Jest
npm run doctor       # expo-doctor (chequeo de SDK)
```

## Variables de entorno

Copia `.env.example` a `.env` y ajusta:

```
API_URL=http://localhost:8000
ENVIRONMENT=development
```

Los valores se exponen vía `app.config.ts` → `Constants.expoConfig.extra` y se leen tipados desde `src/shared/infrastructure/config/env.ts`.

## Arquitectura DDD

La estructura sigue **Domain-Driven Design por bounded contexts** + capas explícitas. Cada feature es un módulo en `src/modules/<nombre>/` con cuatro capas:

```
src/
├── modules/<nombre>/
│   ├── domain/          # Reglas de negocio puras, sin deps externas
│   │   ├── entities/    # Objetos con identidad (User, Expense, ...)
│   │   ├── value-objects/  # Inmutables con invariantes (Email, Money, ...)
│   │   ├── repositories/   # Interfaces (contratos)
│   │   └── errors/         # DomainError específicos
│   ├── application/     # Casos de uso (orquesta el domain)
│   │   ├── use-cases/   # LoginUseCase, CreateExpenseUseCase, ...
│   │   └── dto/         # Input/Output DTOs
│   ├── infrastructure/  # Implementaciones concretas
│   │   ├── repositories/   # HttpAuthRepository, InMemoryAuthRepository
│   │   └── mappers/        # DTO ↔ entidad
│   └── presentation/    # UI específica del módulo
│       ├── screens/     # LoginScreen, ...
│       ├── components/  # LoginForm, ...
│       ├── hooks/       # useLogin (conecta caso de uso ↔ React Query)
│       └── stores/      # useAuthStore (Zustand)
│
├── shared/              # Cross-cutting
│   ├── domain/          # Result type, DomainError base
│   ├── infrastructure/  # http (axios), storage, i18n, config (env)
│   └── presentation/    # Button, Input, Text, theme (tokens, useTheme), providers
│
└── core/                # Bootstrap
    └── di/container.ts  # Composition root — instancia repos + use cases

app/                     # Expo Router — solo wrappers thin de rutas
```

### Reglas de dependencia (enforzadas por `eslint-plugin-boundaries`)

| Desde \ Hacia              |       domain       | application | infrastructure | presentation |   core    |
| -------------------------- | :----------------: | :---------: | :------------: | :----------: | :-------: |
| `domain/` (módulo)         | ✅ propio + shared |             |                |              |           |
| `application/` (módulo)    |         ✅         |     ✅      |                |              |           |
| `infrastructure/` (módulo) |         ✅         |     ✅      |       ✅       |              | ✅ shared |
| `presentation/` (módulo)   |         ✅         |     ✅      |       ❌       |      ✅      |    ✅     |
| `app/` (rutas)             |                    |             |                |      ✅      |    ✅     |
| `core/`                    |         ✅         |     ✅      |       ✅       |              |           |

Si el linter bloquea un import, **no añadas excepciones** — replantea la separación. Los repositorios concretos solo se ven en `core/di/container.ts` (composition root) y se exponen como use cases ya inyectados.

> Si quieres ver la regla en acción, crea un archivo `src/modules/auth/presentation/test.ts` con `import { InMemoryAuthRepository } from '../infrastructure'` y corre `npm run lint`: debe fallar con `boundaries/element-types`.

## Crear un nuevo módulo

1. Crea la estructura: `src/modules/<nombre>/{domain,application,infrastructure,presentation}` con los mismos subfolders que `auth/`.
2. Empieza por **domain**: entidades, value objects, interface del repositorio.
3. **application**: casos de uso que dependen solo del repositorio (interface) y devuelven `Result<T, E>`.
4. **infrastructure**: implementación del repositorio (Http o InMemory).
5. **presentation**: hook (`useXxx`) que llama el use case vía `container`, screen, componentes.
6. Registra la implementación en `src/core/di/container.ts`.
7. Añade rutas en `app/` que importen las screens.

El módulo `auth/` es la plantilla canónica.

## Testing

- Tests unitarios de domain/application bajo `__tests__/` en cada use case
- `npm test` corre Jest con preset `jest-expo`
- Las reglas de boundaries están desactivadas para tests (necesitan componer capas)

## Deuda técnica

- Migrar `boundaries/element-types` → `boundaries/dependencies` con sintaxis object-based v6
- Añadir tests de presentation (Testing Library + mocks de container)
- Configurar Maestro para E2E cuando haya flujos completos
