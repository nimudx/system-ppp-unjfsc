# ADR 0001: Convención de estructura del frontend

- **Fecha:** 2026-11-06
- **Estado:** Propuesto

## Contexto

El frontend (`resources/js`) es un monolito modular con React + TypeScript e Inertia.js. Hoy hay más subcarpetas de las necesarias (`partials/`, `parts/`, `components/` dentro de `pages/`), nombres inconsistentes (`JsonPreview.tsx`, `ToggleGroup.tsx` junto a archivos kebab-case) y componentes duplicados entre módulos. Además:

- `app.tsx` y `ssr.tsx` registran como página **todo** `.tsx` bajo `modules/*/pages/**`, así que un componente auxiliar dentro de `pages/` queda expuesto como página Inertia.
- Un segundo equipo de 6 desarrolladores mantendrá el sistema en unos meses y necesita encontrar cada cosa sin contexto previo.

## Decisión

### 1. Estructura de un módulo

```
resources/js/modules/<dominio>/
├── pages/        # SOLO páginas Inertia (una por ruta)
├── components/   # todo componente que no sea página
├── hooks/        # hooks del módulo (.ts)
├── services/     # llamadas y lógica de cliente (si aplica)
├── types.ts      # tipos del módulo
└── index.ts      # API pública del módulo
```

Lo transversal vive en `resources/js/shared/` (`components/ui`, `components/layout`, `hooks`, `layouts`, `lib`, `types`, `config`).

### 2. Reglas

1. **`pages/` solo contiene páginas.** Los componentes auxiliares van en `components/` del módulo. No existen carpetas `partials/` ni `parts/`.
2. **Máximo 3 niveles** bajo el módulo (`modules/x/components/y/archivo.tsx`). Una subcarpeta se crea solo con 3 o más archivos relacionados.
3. **Nombres de archivo en kebab-case** (`delete-group-modal.tsx`). Componentes y tipos en PascalCase dentro del archivo.
4. **Hooks en `.ts`** (sin JSX), nombrados `use-*.ts`.
5. **Fronteras entre módulos:** un módulo solo importa de otro a través de `@/modules/<otro>` (su `index.ts`), nunca de rutas internas. Lo compartido por 2 o más módulos se mueve a `shared/`.
6. **Un componente usado por 2 o más módulos va en `shared/`;** si lo usa uno solo, queda en su módulo.
7. **Estilos con tokens de Tailwind** (`bg-card`, `bg-muted`, `text-muted-foreground`) y no colores fijos, para que funcione el modo oscuro.
8. **Rutas con Wayfinder** (`@/routes/...`, `@/actions/...`), sin URLs escritas a mano.
9. **Sin datos simulados (mocks) ni `console.log`** en código versionado.
10. **Textos de interfaz en español;** nombres de código en inglés; comentarios en español.

### 3. Aplicación en el código

- Cambiar el glob de `app.tsx` y `ssr.tsx` a `./modules/*/pages/**/*.tsx` solo cuando `pages/` ya contenga únicamente páginas (ver migración).
- Hacer cumplir las fronteras con ESLint (`no-restricted-imports` o `eslint-plugin-boundaries`) en CI.

### 4. Plan de migración

1. Borrar código muerto y restos del starter kit; quitar mocks y `console.log`.
2. Unificar tipos, roles y constantes de estado.
3. Extraer componentes compartidos: `ConfirmDeleteDialog`, `StatCard`, `EmptyState`, `PageContainer`.
4. Aplanar carpetas (`partials/`, `parts/`, `pages/**/components/` → `components/`) y ajustar el glob.
5. Crear `MasterDetailLayout` y `DocumentReviewLayout` para vistas con el mismo diseño.

## Consecuencias

**Positivas**
- Un dev nuevo sabe dónde buscar: página en `pages/`, todo lo demás en `components/`.
- Un archivo auxiliar ya no se registra por error como página Inertia.
- Menos duplicación y menos acoplamiento entre módulos.

**Negativas / costos**
- La migración mueve muchos archivos; los imports cambian y requieren un PR dedicado por módulo para facilitar la revisión.
- Las reglas ESLint de fronteras pueden marcar imports existentes que hay que corregir primero.
- Los módulos deben mantener su `index.ts` actualizado.

**Riesgos**
- Cambiar el glob antes de aplanar `pages/` rompería páginas. Por eso el glob se cambia en el paso 4.