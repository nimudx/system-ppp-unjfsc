# Tarea: refactor de `student-workflow.tsx` (solo reorganización, sin cambios de comportamiento)

## Contexto

Proyecto Laravel + Inertia + React + TypeScript. Frontend organizado por módulos en `resources/js/modules/*` (cada módulo con `components/`, `hooks/`, `pages/`, `services/`, `utils/`, `types.ts`, `index.ts` como barrel).

El flujo de presentación de prácticas del estudiante (`StudentWorkflow`) vive en
`modules/internship/components/submission/student-workflow.tsx` y compone dos dominios:

1. **Solicitud de empresa** (dominio company): `CompanySubmission` (paso 1), `CompanyDataCard`, panel de estado/historial/reenvío de correo, `Callout` de aceptado.
2. **Datos de práctica** (dominio internship): `PracticeForm` (pasos 2 y 3: jefe inmediato, fechas, horas mínimas, modo edición/lectura), `formatPracticeDate`, y el mapeo `desarrollo→development`, `convalidacion→validation`.

Además exporta `Field` y `WorkflowErrors`, utilidades genéricas que probablemente otros archivos importan desde ahí.

## Objetivo

Dejar `StudentWorkflow` como un **orquestador delgado** dentro de `modules/internship/components/submission/` y que cada pieza viva en el módulo al que pertenece. **No debe cambiar ningún comportamiento, texto, estilo, clave de React ni flujo.**

## Fase 0: investigación (solo lectura, NO edites nada todavía)

Antes de tocar código, inspecciona y resume en un reporte corto:

1. Quién importa `student-workflow.tsx` y quién importa `Field` y `WorkflowErrors` desde ese archivo (`grep` en todo `resources/js`). Incluye `request-management.tsx`, `request-history.tsx`, `resource-content.tsx` y las páginas de company e internship.
2. Superposición con código existente para no duplicar:
    - `company/components/request-history.tsx` vs. el panel de estado/historial inline.
    - `internship/hooks/use-placement-submission.ts`, `use-workflow.ts`, `pages/submission/placement-index.tsx` y `components/submission/company-required-card.tsx` vs. `PracticeForm`. ¿Ya existe lógica o mapeo de tipos equivalente (`desarrollo`/`development`)?
    - `internship/utils/practice-duration.ts`: ¿dónde conviene colocar `formatPracticeDate`?
3. Qué importa hoy `internship` desde `company` y viceversa. Mapea la dirección de dependencias actual.
4. Cómo está implementado `workflow.placement(...)` en `company/services/company-workflow.ts` (endpoint, helper HTTP/CSRF compartido, manejo de errores con `WorkflowError`) y si puede reutilizarse fuera de company.
5. Qué exporta hoy el `index.ts` de `company` y de `internship`.

Entrega ese reporte con la **decisión de diseño** para los puntos abiertos (ver restricciones) antes de pasar a la Fase 1.

## Restricción crítica: dirección de dependencias

La dependencia permitida es **internship → company**: `StudentWorkflow` (en internship) compone las piezas públicas de solicitud de empresa. Está **prohibido** que company importe componentes, tipos o servicios de internship, porque generaría un ciclo.

- `company` conserva el dominio de la solicitud de empresa: servicio (`company-workflow`), `stateLabels`, tipos, `CompanySubmission`, `CompanyDataCard`, `RequestStatusPanel`, `Callout` y `LockedStepCard`.
- `internship` consume esos exports públicos desde `@/modules/company`.
- Ningún barrel reexporta `StudentWorkflow`; se importa directamente desde `internship/components/submission/student-workflow`.
- `PracticeForm` recibe props mínimas y agnósticas (`companyId`, `placement`, `type`, `origin`, `onSaved`) en lugar del objeto `current` completo.
- `WorkflowErrors` es genérico y vive en `shared/components/workflow-ui.tsx`; lee `errors` por duck-typing, sin importar `WorkflowError`.

## Estructura actual

**`modules/company/components/`**

- `company-submission.tsx`: `CompanySubmission` (paso 1).
- `company-data-card.tsx`: `CompanyDataCard`.
- `request-status-panel.tsx`: panel de estado, comentarios, reenvío e historial (reutiliza o integra `request-history.tsx` si ya hace lo mismo; no dupliques).
- `workflow-ui.tsx`: reexporta `Field`, `WorkflowErrors` y `DataItem` desde shared; conserva `Callout`, `LockedStepCard`, `cn`, `ConsentCheck` y las primitivas de pasos.

**`modules/company/`**

- `services/company-workflow.ts`: servicio, `stateLabels`, tipos y helpers HTTP/CSRF.
- `index.ts`: API pública del dominio (`CompanySubmission`, `CompanyDataCard`, `RequestStatusPanel`, `Callout`, `LockedStepCard`, `stateLabels`, `workflow`, `useCompanyRequest`, `RequestHistory`, `CompanyRequest`).

**`modules/internship/`**

- `components/submission/student-workflow.tsx`: orquestador del flujo de presentación de prácticas (carga/error, composición de secciones, bloques locked, lógica de `resend`). Mantiene el `export default` y su firma de props actual.
- `components/submission/practice-form.tsx`: `PracticeForm` (formulario + vista de lectura/edición), con `practice-summary.tsx` para la vista de solo lectura.
- `utils/practice-duration.ts`, `utils/format-practice-date.ts`, `utils/internship-type.ts`.
- `index.ts`: exporta utilidades, `placementService`, `PracticeForm` y tipos. No exporta `StudentWorkflow`.

Los tipos que se comparten entre módulos viven en `shared`, no en company, para respetar la dirección de dependencias.

## Pasos de ejecución (un commit por paso, o checkpoint verificable por paso)

1. Mover `Field`, `WorkflowErrors`, `DataItem`, `LockedStepCard` a `workflow-ui.tsx` (o shared según el caso) y actualizar todos los imports. Verificar.
2. Extraer `normalizeInternshipType` y `formatPracticeDate` a internship/utils. Verificar.
3. Mover `PracticeForm` a internship con props desacopladas y resolver `workflow.placement` según la decisión. Verificar que no hay ciclo.
4. Extraer `CompanySubmission`, `CompanyDataCard` y el panel de estado a sus archivos.
5. Mantener `student-workflow.tsx` como orquestador delgado en `internship/components/submission/` y limpiar imports sin usar.
6. Actualizar los barrels `index.ts` de ambos módulos.

## Invariantes (no negociables)

- Mismos textos en español, mismos `toast`, mismas clases Tailwind, mismos `key` (`key={placement?.id ?? 'new'}`, `key={`${current?.id ?? 'new'}-${current?.state ?? ''}`}`), mismos `disabled`/`required`/`maxLength`.
- Se conserva `router.reload()` tras guardar la práctica y el comportamiento de `onSaved`.
- No cambiar la API HTTP, los endpoints ni los payloads (`internship_type` en inglés, `origin_type`, `practice_declaration_accepted`, `placement`).
- No renombrar tipos públicos ni cambiar el backend.
- Identificadores en inglés, strings de UI en español, como ya está.
- No introducir dependencias nuevas.

## Verificación obligatoria (ejecútala tú y reporta la salida)

- `npx tsc --noEmit` sin errores.
- ESLint y Prettier/format del proyecto sin errores en los archivos tocados.
- Comprobación de ciclos entre módulos (`npx madge --circular --extensions ts,tsx resources/js/modules` o equivalente; si no está instalado, usa `grep` sobre los imports para demostrar que `internship` no importa de `company`).
- Tests del proyecto, si existen para estos componentes (`npm test` / `vitest`).
- `npm run build` exitoso.
- `grep` final confirmando que no quedan imports huérfanos de `Field`/`WorkflowErrors` apuntando a `student-workflow`.

## Qué NO hacer

- No reescribir lógica ni "mejorar" el código mientras lo mueves; si ves un bug o mejora posible, anótalo en el reporte final, no lo apliques.
- No dejar archivos duplicados ni código muerto.
- No mover más cosas de las listadas sin justificarlo.

## Entregable final

Un resumen con: (1) árbol de archivos creados/movidos/modificados, (2) decisión tomada sobre `workflow.placement` y el componente de errores con su justificación, (3) salida de las verificaciones, (4) lista de hallazgos o mejoras no aplicadas.
