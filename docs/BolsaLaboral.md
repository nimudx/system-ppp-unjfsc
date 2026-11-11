# Prompt: Bolsa Laboral UNJFSC (v1, selección por docente titular)

Eres un desarrollador senior en `system-ppp-unjfsc` (Laravel 12 + Inertia/React/TS, monolito modular por dominios). Implementa el módulo **JobBoard** descrito abajo. Antes de escribir código, **lee lo que ya existe** (sección 2) y respeta `CLAUDE.md`. Si algo choca con él, dilo y propón alternativa; no lo resuelvas en silencio.

## 1. Objetivo y flujo

Aumentar la empleabilidad de los estudiantes. Las empresas publican vacantes; la universidad filtra y propone candidatos. **El contacto final con la empresa es manual** (lo hace el administrador). El sistema solo ordena el proceso y deja trazabilidad.

1. **Empresa** (cuenta ya activada, `type_user_id = 3`) ve en su menú **Bolsa laboral** con etiqueta **"Nuevo"**, crea una vacante y la envía a revisión.
2. **Administrador** (rol 1/2) ve las vacantes nuevas (con etiqueta "Nuevo"), las revisa y las **aprueba / observa / rechaza**. Al aprobar, confirma las escuelas destino y el sistema **avisa a los docentes titulares** de esas escuelas (el admin también puede avisar de nuevo).
3. **Docente titular** (rol 3) ve las vacantes publicadas para su escuela, revisa **récord académico y CV** de los estudiantes de **su sección** y **propone candidatos** con una nota.
4. El sistema **notifica al administrador** de cada propuesta. El admin contacta a la empresa fuera del sistema y marca manualmente el estado de cada candidato (contactado / contratado / descartado) y cierra la vacante.

La empresa **no ve datos de estudiantes dentro del sistema** (datos personales; el CV lo envía el admin a mano).

## 2. Contexto real del repo (verificado, respétalo)

- Estructura real: `app/Domains/{Dominio}/{Models,Services,Http/Controllers,Http/Requests,Enums,Exceptions,Policies,routes/web.php}`. **`CLAUDE.md` dice `app/Services/...`: está desactualizado, sigue `app/Domains/`.** Las rutas de cada dominio se cargan solas con `ModuleRouteRegistrar` (glob `Domains/*/routes/web.php`, middleware `web`).
- `app/Domains/JobBoard/` ya existe con carpetas vacías (`.gitkeep`) y `routes/web.php` con solo `GET /bolsa` (`name bolsa.index`) que renderiza `jobboard/public/index`.
- `resources/js/modules/jobboard/pages/public/index.tsx` es un **login de empresa de demostración** (el submit siempre muestra "Usuario o contraseña inválidos"). El login real es Fortify en `/login`.
- Ya existen migraciones `2026_03_29_*` de `vacancies`, `vacancy_schools`, `applications`; factories `VacancyFactory`, `ApplicationFactory`, `CompanyFactory`; tests en `tests/Feature/JobBoard/*` y borradores `2026_10_20_00000{5..8}_*.php.gitkeep` (deshabilitados a propósito).
- Empresas: `Company` (status, `account_user_id`, `activated_at`, `approved_at`). Se aprueban **por el docente titular** vía `CompanyValidationRequest`, no por el admin. `CompanyWorkflowAccess::company($user)` ya devuelve la empresa activa del usuario (type 3, status 1, activada) o 403.
- Notificaciones: `NotificationService::notify(type, actor, subject, payload, resolver)`. El frontend resuelve el link con `resolveWayfinderUrl`, que **solo busca rutas bajo `academic.*` y pasa los params como query string**. Por eso las rutas que se notifiquen deben llamarse `academic.jobboard.*` y abrir el detalle por `?v={id}` (mismo patrón que dossier con `?a=`, usando `useItemDetail({ urlQueryKey: 'v' })` + `useConfigTable`).
- Navegación: `resources/js/shared/config/navigation.tsx` (`ACADEMIC_NAV`, `COMPANY_NAV`), `NavItem` en `shared/types/navigation.ts`, render en `shared/components/layout/nav-main.tsx`. Hoy `NavItem` **no tiene badge**.
- Documentos: `Document::signedFileUrl()` (disco `public` + ruta firmada). `Assignment::isApproved()` indica expediente validado (ficha + récord aprobados).
- Middlewares usados: `auth`, `type:1,2`, `type:3`, `approved`, `role:...`.

## 3. Decisiones por defecto (avanza con ellas; si alguna no cuadra, avísame antes de la fase 2)

1. **Reemplaza la postulación directa del estudiante** (descrita en `CLAUDE.md`) por **propuesta del docente titular**. Documéntalo en un ADR. Los tests `EligibilityTest`, `DuplicateApplicationTest`, `ApplicationStatusTransitionsTest`, `PublicListingTest` hoy asumen el flujo viejo: léelos, **adáptalos o reubícalos, no los borres**, y dime qué hiciste con cada uno.
2. **No crees otra aprobación de empresas.** Publicar exige empresa activa según `CompanyWorkflowAccess`. No habilites el borrador `000005` (`approval_status` en companies).
3. **Sin listado público** en v1 (no aplica cache ni throttle público). `/bolsa` queda como entrada para empresas; propón reemplazar el login falso por un enlace a `/login` y **pregúntame** antes de tocarlo.
4. **Alcance del subadmin (rol 2):** ve vacantes cuyas escuelas destino pertenezcan a su facultad; el admin (rol 1) ve todo.
5. **Escuelas destino:** las propone la empresa al crear; el admin puede ajustarlas al aprobar.
6. **CV:** buscar `DocumentType` con code `cv` en los documentos del dossier del estudiante. Si no existe, mostrar "Sin CV" (no inventes la subida; señálame la brecha).
7. Notificaciones **solo dentro del sistema** en v1. Si luego se añade correo, va en cola (`ShouldQueue`, `afterCommit`), como `CompanyStudentInvitation`.

## 4. Modelo de datos

Crea **migraciones nuevas** (nunca edites las existentes). Primero lee las existentes y escribe solo el diferencial; no renombres ninguna.

- `vacancies`: `company_id` (FK), `semester_id` (solo reporte), `title`, `description`, `type` (`practicas|empleo`), `modality` (`presencial|remoto|hibrido`), `area_name`, `location`, `positions_count`, `requirements` (text), `deadline_at` (nullable), `status`, `review_comment`, `reviewed_by_assignment_id`, `reviewed_at`, `published_at`, `closed_at`, `closed_reason`. Índices: `(status, semester_id)`, `(company_id, status)`.
- `vacancy_schools`: `vacancy_id`, `school_id`, único `(vacancy_id, school_id)`.
- `vacancy_candidates`: `vacancy_id`, `student_assignment_id`, `proposed_by_assignment_id`, `note` (max 500), `status`, `status_note`, timestamps. **Único `(vacancy_id, student_assignment_id)`** e índice `(vacancy_id, status)`.
- `vacancy_views`: `vacancy_id`, `user_id`, `seen_at`, único `(vacancy_id, user_id)` (alimenta "Nuevo").
- FKs con `cascadeOnDelete` solo en tablas pivote/vistas; en candidatos usa `restrictOnDelete`.

Enums (respaldados, en `Domains/JobBoard/Enums`): `VacancyStatus` (`draft, pending_review, observed, rejected, published, closed`), `VacancyType`, `VacancyModality`, `CandidateStatus` (`proposed, contacted, hired, discarded`), `VacancyCloseReason` (`filled, expired, withdrawn`).

Transiciones de vacante (validar en el servicio, no en el controlador):
`draft→pending_review`, `observed→pending_review` (empresa) · `pending_review→published|observed|rejected` (admin) · `published→closed` (admin o empresa). Edición por la empresa **solo** en `draft` y `observed`.

## 5. Permisos (Policy + filtro en la consulta)

- **Empresa:** solo sus vacantes → `where('company_id', $company->id)` en la query, nunca comparar IDs después. No ve candidatos.
- **Admin:** todas (rol 2 filtrado por facultad). Aprueba/observa/rechaza (comentario obligatorio en observar/rechazar), cierra, gestiona estados de candidatos.
- **Titular:** solo vacantes `published` cuyas escuelas incluyan la de su sección. Solo puede proponer estudiantes con `role_id = 5`, `status = 1`, **misma sección y semestre que él** y `isApproved()`. Puede retirar una propuesta mientras esté en `proposed`.
- Autoriza con `Gate::authorize`/Policy en cada acción, además de los middlewares de ruta.

## 6. Backend por capas

- `Services/VacancyService` (CRUD empresa + transiciones), `VacancyReviewService` (admin), `CandidateProposalService` (titular + estados del admin), `VacancyNewBadgeService` (marca vista y calcula "Nuevo").
- Controladores delgados + `FormRequest` con mensajes en español.
- Excepciones `BusinessException` (con `status()` y `code()`): `VacancyInvalidTransition` (409), `VacancyNotEditable` (409), `CandidateAlreadyProposed` (409), `CandidateNotEligible` (422), `CompanyNotActive` (403). **Captura la violación del índice único** de candidatos y conviértela en `CandidateAlreadyProposed` (no confíes solo en validación previa; hay concurrencia).
- Envuelve en `DB::transaction` las operaciones multi-tabla.
- La empresa activa se obtiene con `CompanyWorkflowAccess::company()`. Para no acoplar módulos, expónlo vía un contrato en `Domains/Company/Contracts/` y úsalo desde JobBoard.
- `config/jobboard.php`: `new_days` (14) y `menu_badge_until` (fecha de vencimiento de la etiqueta del menú).

## 7. Rutas

Archivo `Domains/JobBoard/routes/web.php`:

| Actor | Middleware | Prefijo / nombre |
|---|---|---|
| Empresa | `auth`, `type:3` | `empresa/bolsa` · `company.jobboard.*` |
| Admin | `auth`, `type:1,2`, `approved`, `role:1,2` | `bolsa/administracion` · `academic.jobboard.admin.*` |
| Titular | `auth`, `type:1,2`, `approved`, `role:3` | `bolsa/vacantes` · `academic.jobboard.teacher.*` |

Las pantallas admin/titular son índice + detalle por `?v=`. Throttle en los POST de empresa (`throttle:10,60`). Regenera Wayfinder (`php artisan wayfinder:generate` si el plugin de Vite no lo hace).

## 8. Notificaciones

Tipos nuevos: `VACANCY_SUBMITTED` (a admins), `VACANCY_REVIEWED` (a la empresa: observada/rechazada/publicada), `VACANCY_PUBLISHED` (a titulares de las escuelas destino), `CANDIDATE_PROPOSED` (a admins). Los destinatarios admin son los `Assignment` con rol 1/2 (`resolveAcademicRoles` filtra por sección y no sirve para admins globales). Registra cada tipo en `NOTIFICATION_CONFIG` (`modules/notifications/config/notification.tsx`) con `esc()` para todo texto de usuario. La acción apunta a `academic.jobboard.*` con `?v=`. Las notificaciones a la empresa (type 3) no pasan por `academic.*`: revisa cómo resuelve `resolve-url.ts` el caso `company-validation` y replica ese patrón.

## 9. Frontend (`resources/js/modules/jobboard/`)

Estructura del módulo: `pages/`, `components/`, `hooks/`, `types.ts`, `index.ts` (API pública). Páginas Inertia: `jobboard/company/index|form`, `jobboard/admin/index`, `jobboard/teacher/index`. Reutiliza `AppLayout`, `SectionCard`, `Heading`, `useConfigTable`, `useItemDetail`, `AcademicFilter`, `DocumentViewer/FilePreview` y los estilos existentes. UI en español.

- **Empresa:** listado con estado y comentario de revisión, formulario crear/editar (escuelas destino multiselect), enviar a revisión, cerrar.
- **Admin:** tabla + panel de detalle (datos de la empresa y contacto, acciones aprobar/observar/rechazar con checkbox "Notificar a docentes titulares", y lista de candidatos con cambio manual de estado + nota).
- **Titular:** lista de vacantes + panel con **selector de estudiantes de su sección**: nombre, estado de récord y CV con vista previa (URL firmada), marca "ya propuesto", selección múltiple y nota. Usa `StudentSelectorTable` como base si encaja, sin romper su uso actual.

## 10. Etiqueta "Nuevo"

1. **Menú (descubrimiento):** añade `badge?: string` a `NavItem`, píntalo en `nav-main.tsx`, y agrega "Bolsa laboral" a `COMPANY_NAV` y `ACADEMIC_NAV` (roles 1,2,3) con badge "Nuevo" hasta `jobboard.menu_badge_until`. Se oculta al visitar la sección (localStorage envuelto en `try/catch`, solo como comodidad por usuario). Añade también una tarjeta en `company-content.tsx` invitando a publicar la primera vacante.
2. **Vacantes:** `is_new` lo calcula el backend por usuario: no existe fila en `vacancy_views` y la vacante entró (admin: `pending_review`; titular: `published`) hace menos de `new_days`. Al abrir el detalle se registra la vista. La etiqueta se muestra en la fila.

## 11. Tests (Pest) y documentación

Cubre como mínimo: aislamiento entre empresas (no ve ni edita vacantes ajenas), empresa inactiva no puede publicar, transiciones válidas e inválidas de vacante, aprobación admin con notificación a titulares correctos, titular no ve vacantes de otras escuelas, propuesta de estudiante de otra sección/inactivo/no aprobado rechazada, candidato duplicado (incluida la violación del índice único), "Nuevo" desaparece tras ver el detalle, subadmin limitado a su facultad.

Documenta en `docs/adr/0001-bolsa-laboral-seleccion-por-docente.md` (contexto, decisión, consecuencias, fecha) y una sección breve en `docs/Database.md` con las tablas nuevas.

## 12. Fuera de alcance (no lo hagas)

Postulación directa del estudiante, listado público, que la empresa vea candidatos, chat, envío automático de CV, correo, Redis/MinIO, dependencias nuevas, microservicios.

## 13. Orden de trabajo y definición de terminado

Trabaja por fases y **confírmame al final de cada una** con un resumen de 3-4 líneas: 0) reconocimiento y conflictos detectados → 1) migraciones, modelos, enums → 2) servicios, excepciones, policies, rutas → 3) notificaciones → 4) frontend empresa → 5) frontend admin y titular → 6) "Nuevo" y navegación → 7) tests, ADR, docs.

Terminado cuando: `php artisan test --filter=JobBoard` en verde, suite completa sin regresiones, `vendor/bin/pint`, `npm run lint` y `npx tsc --noEmit` limpios, Wayfinder regenerado, y me entregas la lista de riesgos que encontraste (por ejemplo: archivos en disco `public` con URL firmada, falta de CV en el dossier, tests viejos reubicados). Señala cualquier problema de seguridad o rendimiento adicional que veas, pero no lo cambies sin preguntarme.

## Aclaración sobre autenticación y navegación

La Bolsa Laboral es un módulo adicional del sistema `system-ppp-unjfsc`, no un sistema independiente.

- Utilizar exclusivamente la autenticación existente de Laravel Fortify.
- No crear, modificar ni reemplazar ningún sistema de login.
- No crear nuevos roles ni tipos de usuario.
- Integrar las opciones de Bolsa Laboral directamente en los menús existentes (`COMPANY_NAV` y `ACADEMIC_NAV`).
- Cada opción del menú debe dirigir a la interfaz correspondiente según los permisos del usuario autenticado.
- Las rutas del módulo deben protegerse mediante los middlewares, policies y permisos existentes.
- No utilizar `/bolsa` como punto obligatorio de acceso al módulo.
- No modificar la pantalla de demostración `jobboard/public/index.tsx` ni su ruta `/bolsa` sin autorización previa. Si quedan fuera del flujo, simplemente no utilizarlas.

La navegación debe funcionar dentro del sistema actual, respetando el inicio de sesión y la estructura de roles y tipos de usuario existentes.