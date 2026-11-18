# Refactor: Mover StudentWorkflow de `company` a `internship`

## Objetivo

Mover el componente `StudentWorkflow` desde el módulo `company` al módulo `internship`, ya que es el responsable de orquestar el flujo de presentación de prácticas del estudiante.

Este cambio busca corregir el ownership del componente y eliminar la dependencia `company → internship`, sin modificar el comportamiento funcional ni mezclar responsabilidades entre módulos.

## 1. Antes de modificar

Inspecciona el estado actual del repositorio y verifica:

- La ubicación actual de `StudentWorkflow`.
- Sus imports y dependencias.
- Los exports de `company/index.ts` e `internship/index.ts`.
- Su único consumidor en `placement-index.tsx`.
- La documentación `docs/Student-workflow.md`.

No sobrescribas cambios existentes ni modifiques archivos ajenos a este refactor.

## 2. Movimiento del componente

Mover:

`resources/js/modules/company/components/student-workflow.tsx`

A:

`resources/js/modules/internship/components/submission/student-workflow.tsx`

Utiliza `git mv` para conservar el historial del archivo.

Mantén intactos:

- La firma de props (`current`, `loading`, `error`, `reload`, `placement`, `type`, `origin`).
- El export default.
- Los textos, estilos Tailwind y estructura visual.
- Los estados, condiciones y comportamiento.
- Los payloads y endpoints.
- Las keys y lógica de renderizado.

Únicamente modifica las rutas de importación necesarias.

## 3. Actualizar imports

En el componente movido, utiliza los exports públicos de `company/index.ts` para las dependencias del dominio empresarial:

- `Callout`
- `CompanyDataCard`
- `CompanySubmission`
- `LockedStepCard`
- `RequestStatusPanel`
- `stateLabels`
- `workflow`
- `CompanyRequest` (tipo)

Mantén los imports correspondientes a:

- `WorkflowErrors` desde `@/shared/components/workflow-ui`.
- `PlacementRecord` desde los tipos de internship.
- `PracticeForm` desde el directorio correspondiente.
- Los componentes y utilidades compartidos que ya utiliza (`Button`, `Link`, `toast`, etc.).

Evita introducir imports innecesarios o cambiar dependencias que no estén relacionadas con el movimiento.

## 4. Actualizar `company/index.ts`

Eliminar el export de `StudentWorkflow`.

Agregar los exports públicos que necesita el componente desde internship:

- `CompanyDataCard`
- `CompanySubmission`
- `RequestStatusPanel`
- `Callout`
- `LockedStepCard`
- `stateLabels`
- `workflow`

Respeta las convenciones de exportación existentes y evita duplicados.

**Importante:** No crear un re-export de `StudentWorkflow` desde `company/index.ts` ni desde `internship/index.ts`.

## 5. Actualizar `placement-index.tsx`

Archivo:

`resources/js/modules/internship/pages/submission/placement-index.tsx`

- Eliminar `StudentWorkflow` del import proveniente de `company`.
- Importar el componente directamente desde:

`../../components/submission/student-workflow`

- Mantener las demás dependencias de `company`, como `useCompanyRequest`, `RequestHistory` y `CompanyRequest`, donde corresponda.

No mover lógica del dominio empresarial a internship.

## 6. Actualizar documentación

Modificar `docs/Student-workflow.md` para reflejar la nueva arquitectura:

- `StudentWorkflow` pertenece a `internship`.
- Es el orquestador del flujo de presentación de prácticas.
- `company` conserva la lógica, servicios, estados y componentes propios de las solicitudes empresariales.
- La dependencia permitida para este flujo es `internship → company`.

La documentación debe coincidir con la estructura real del código.

## 7. Restricciones arquitectónicas

Respetar estrictamente estas reglas:

1. `company` no puede importar componentes, tipos ni servicios de `internship`.
2. `internship` puede consumir las dependencias públicas de `company`.
3. No crear ciclos mediante barrels (`index.ts`).
4. No exportar `StudentWorkflow` desde ningún barrel.
5. No mover `useCompanyRequest`, `RequestHistory` ni los servicios de solicitudes empresariales.
6. No realizar limpiezas adicionales ni refactors fuera del alcance.

Los componentes `ConsentCheck`, `StepBadge`, `StepCard` y `StepState` de `company/components/workflow-ui.tsx` no tienen consumidores conocidos. No eliminarlos ni modificarlos en esta tarea.

## 8. Verificaciones obligatorias

Después de implementar los cambios, ejecutar:

- TypeScript: `npx tsc --noEmit` (o el comando equivalente configurado).
- ESLint sobre los archivos modificados.
- Prettier sobre los archivos modificados.
- Detección de dependencias circulares con Madge (`--circular`).
- Búsqueda de imports `company → internship`.
- `npm run build`.
- Tests de Laravel.

Si algún comando falla:

- Determina si el error fue introducido por este refactor.
- Corrige los errores atribuibles a los cambios realizados.
- No ocultes errores preexistentes ni alteres configuraciones para hacer pasar las verificaciones.

## 9. Criterios de aceptación

El trabajo estará terminado cuando:

- [ ] `StudentWorkflow` esté ubicado en `internship/components/submission/`.
- [ ] `company` no tenga dependencias hacia `internship`.
- [ ] `placement-index.tsx` importe directamente el componente desde internship.
- [ ] Los exports públicos de company estén correctamente actualizados.
- [ ] No existan dependencias circulares.
- [ ] La documentación refleje el nuevo ownership.
- [ ] Se conserve el comportamiento funcional original.
- [ ] Las verificaciones hayan sido ejecutadas y sus resultados documentados.

## 10. Informe final

Al terminar, presenta:

1. Archivos movidos y modificados.
2. Resumen de los cambios realizados.
3. Confirmación de las reglas arquitectónicas verificadas.
4. Resultado individual de cada comando de validación.
5. Errores encontrados, indicando si son preexistentes o consecuencia del refactor.

**No realices commits ni pushes.**

Implementa directamente el refactor siguiendo este alcance. No te limites a proponer cambios: inspecciona, modifica y verifica el código.
