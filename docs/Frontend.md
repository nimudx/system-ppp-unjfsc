📁 resources/js
├── 📄 app.tsx                                         ✏️ nuevo resolver de páginas (ver nota al final)
├── 📄 ssr.tsx                                         ✏️ idem
├── 🔄 📁 routes                                       # Wayfinder (generado)
├── 🔄 📁 actions                                      # Wayfinder (generado)
│
├── 📁 shared                                          # Sin lógica de negocio, sin imports de modules/
│   ├── 📁 components
│   │   ├── 📁 ui                                      # Shadcn (sin cambios de contenido)
│   │   │   ├── 📄 accordion.tsx
│   │   │   ├── 📄 alert-dialog.tsx
│   │   │   ├── 📄 alert.tsx
│   │   │   ├── 📄 avatar.tsx
│   │   │   ├── 📄 badge.tsx
│   │   │   ├── 📄 breadcrumb.tsx
│   │   │   ├── 📄 button.tsx
│   │   │   ├── 📄 card.tsx
│   │   │   ├── 📄 checkbox.tsx
│   │   │   ├── 📄 collapsible.tsx
│   │   │   ├── 📄 combobox.tsx
│   │   │   ├── 📄 dialog.tsx
│   │   │   ├── 📄 dropdown-menu.tsx
│   │   │   ├── 📄 form.tsx
│   │   │   ├── 📄 icon.tsx
│   │   │   ├── 📄 input-group.tsx
│   │   │   ├── 📄 input-otp.tsx
│   │   │   ├── 📄 input.tsx
│   │   │   ├── 📄 label.tsx
│   │   │   ├── 📄 navigation-menu.tsx
│   │   │   ├── 📄 pagination.tsx
│   │   │   ├── 📄 placeholder-pattern.tsx
│   │   │   ├── 📄 radio-group.tsx
│   │   │   ├── 📄 scroll-area.tsx
│   │   │   ├── 📄 section-card.tsx
│   │   │   ├── 📄 select.tsx
│   │   │   ├── 📄 separator.tsx
│   │   │   ├── 📄 sheet.tsx
│   │   │   ├── 📄 sidebar.tsx
│   │   │   ├── 📄 skeleton.tsx
│   │   │   ├── 📄 spinner.tsx
│   │   │   ├── 📄 switch.tsx
│   │   │   ├── 📄 table.tsx
│   │   │   ├── 📄 tabs.tsx
│   │   │   ├── 📄 textarea.tsx
│   │   │   ├── 📄 toggle-group.tsx
│   │   │   ├── 📄 toggle.tsx
│   │   │   └── 📄 tooltip.tsx
│   │   ├── 📁 data-table
│   │   │   ├── 📄 academic-filter.tsx                 ← components/academic
│   │   │   ├── 📄 academic-pagination.tsx             ← components/academic
│   │   │   └── 📄 academic-search.tsx                 ← components/academic
│   │   ├── 📁 layout
│   │   │   ├── 📄 app-content.tsx
│   │   │   ├── 📄 app-header.tsx
│   │   │   ├── 📄 app-shell.tsx
│   │   │   ├── 📄 app-sidebar.tsx
│   │   │   ├── 📄 app-sidebar-header.tsx
│   │   │   ├── 📄 breadcrumbs.tsx
│   │   │   ├── 📄 nav-footer.tsx
│   │   │   ├── 📄 nav-main.tsx
│   │   │   ├── 📄 nav-user.tsx
│   │   │   ├── 📄 user-info.tsx
│   │   │   ├── 📄 user-menu-content.tsx
│   │   │   ├── 📄 exception-handler.tsx
│   │   │   ├── 📄 historic-notice.tsx
│   │   │   └── 📄 assignment-access-notice.tsx
│   │   ├── 📄 alert-error.tsx
│   │   ├── 📄 app-logo.tsx
│   │   ├── 📄 app-logo-icon.tsx
│   │   ├── 📄 appearance-tabs.tsx
│   │   ├── 📄 heading.tsx
│   │   ├── 📄 input-error.tsx
│   │   ├── 📄 stepper.tsx                             ← components/general/stepper.tsx
│   │   └── 📄 text-link.tsx
│   ├── 📁 config
│   │   └── 📄 navigation.tsx                          ← config/navigation.tsx
│   ├── 📁 hooks
│   │   ├── 📄 use-academic-table.tsx
│   │   ├── 📄 use-appearance.tsx
│   │   ├── 📄 use-clipboard.ts
│   │   ├── 📄 use-config-table.tsx                    # ⚠️ unificar con use-academic-table (hacen casi lo mismo)
│   │   ├── 📄 use-current-url.ts
│   │   ├── 📄 use-initials.tsx
│   │   ├── 📄 use-item-detail.tsx
│   │   ├── 📄 use-mobile-navigation.ts
│   │   └── 📄 use-mobile.tsx
│   ├── 📁 layouts
│   │   ├── 📄 app-layout.tsx
│   │   ├── 📄 auth-layout.tsx
│   │   ├── 📁 app
│   │   │   ├── 📄 app-header-layout.tsx
│   │   │   └── 📄 app-sidebar-layout.tsx
│   │   ├── 📁 auth
│   │   │   ├── 📄 auth-card-layout.tsx
│   │   │   ├── 📄 auth-simple-layout.tsx
│   │   │   └── 📄 auth-split-layout.tsx
│   │   └── 📁 settings
│   │       ├── 📄 layout.tsx
│   │       └── 📄 academic-settings-layout.tsx        ← layouts/academic/settings-layout.tsx
│   ├── 📁 lib
│   │   └── 📄 utils.ts
│   └── 📁 types
│       ├── 📄 auth.ts
│       ├── 📄 global.d.ts
│       ├── 📄 index.ts
│       ├── 📄 navigation.ts
│       ├── 📄 ui.ts
│       └── 📄 vite-env.d.ts
│
├── 📁 modules
│   │
│   ├── 📁 public                                      # Páginas sin sesión
│   │   └── 📁 pages
│   │       ├── 📄 landing.tsx
│   │       └── 📄 welcome.tsx
│   │
│   ├── 📁 identity                                    # Auth, perfil, 2FA, gestión de usuarios
│   │   ├── 📁 pages
│   │   │   ├── 📁 auth
│   │   │   │   ├── 📄 confirm-password.tsx
│   │   │   │   ├── 📄 forgot-password.tsx
│   │   │   │   ├── 📄 login.tsx
│   │   │   │   ├── 🗑️ register.tsx                    # todo comentado, sin uso
│   │   │   │   ├── 📄 reset-password.tsx
│   │   │   │   ├── 📄 two-factor-challenge.tsx
│   │   │   │   └── 📄 verify-email.tsx
│   │   │   ├── 📁 settings
│   │   │   │   ├── 📄 about.tsx
│   │   │   │   ├── 📄 appearance.tsx
│   │   │   │   ├── 📄 password.tsx
│   │   │   │   ├── 📄 profile.tsx
│   │   │   │   └── 📄 two-factor.tsx
│   │   │   └── 📁 users                               ← pages/academic/user/management
│   │   │       ├── 📄 index.tsx
│   │   │       ├── 📁 hooks
│   │   │       │   └── 📄 use-user-management.ts
│   │   │       └── 📁 partials
│   │   │           ├── 📄 manage-assignment-modal.tsx
│   │   │           └── 📄 pending-request-modal.tsx
│   │   ├── 📁 components
│   │   │   ├── 📄 delete-user.tsx
│   │   │   ├── 📄 two-factor-recovery-codes.tsx
│   │   │   ├── 📄 two-factor-setup-modal.tsx
│   │   │   ├── 📄 profile-hero.tsx                    ← pages/settings/partials
│   │   │   ├── 📄 update-person-profile-form.tsx
│   │   │   └── 📄 update-company-profile-form.tsx
│   │   ├── 📁 hooks
│   │   │   └── 📄 use-two-factor-auth.ts
│   │   └── 📄 index.ts
│   │
│   ├── 📁 registration                                # Alta de usuarios
│   │   ├── 📁 pages
│   │   │   └── 📁 register                            ← pages/academic/user/register
│   │   │       ├── 📄 index.tsx
│   │   │       ├── 📁 components
│   │   │       │   ├── 📄 RegistrationModeSelector.tsx
│   │   │       │   ├── 📄 SidebarInfo.tsx
│   │   │       │   ├── 📄 ToggleGroup.tsx
│   │   │       │   ├── 📄 steps.config.ts
│   │   │       │   ├── 🗑️ Stepper.tsx                 # duplicado: usar shared/components/stepper
│   │   │       │   └── 📁 AcademicSelector
│   │   │       │       ├── 📄 AcademicSelector.tsx
│   │   │       │       ├── 📄 academic.schema.ts
│   │   │       │       └── 📄 useAcademicAutoResolver.ts
│   │   │       └── 📁 person
│   │   │           ├── 📄 PersonFlow.tsx
│   │   │           ├── 📄 person.service.ts
│   │   │           ├── 📄 person.types.ts
│   │   │           └── 📁 partials
│   │   │               ├── 📁 person
│   │   │               │   ├── 📁 step-one   (PersonVStepOne.tsx, schema.ts)
│   │   │               │   ├── 📁 step-two   (PersonFStepTwo.tsx, schema.ts)
│   │   │               │   └── 📁 step-three (PersonSStepThree.tsx)
│   │   │               └── 📁 person-massive
│   │   │                   ├── 📁 step-one   (MassiveVStepOne.tsx, schema.ts, csv.schema.ts, csv.utils.ts, components/CsvPreview.tsx, components/CsvUploader.tsx)
│   │   │                   ├── 📁 step-two   (MassiveSStepTwo.tsx, partials/DataPreviewModal.tsx)
│   │   │                   └── 📁 step-three (MassiveRStepThree.tsx)
│   │   └── 📄 index.ts
│   │
│   ├── 📁 dashboard
│   │   ├── 📁 pages
│   │   │   └── 📄 dashboard.tsx                       ← pages/dashboard.tsx
│   │   └── 📁 components
│   │       ├── 📄 admin-content.tsx                   ← pages/academic/dashboard
│   │       ├── 📄 student-content.tsx                 # ⚠️ datos hardcodeados (demo)
│   │       ├── 📄 supervisor-content.tsx              # ⚠️ idem
│   │       ├── 📄 teacher-content.tsx                 # ⚠️ idem
│   │       ├── 📄 superadmin-content.tsx              ← pages/admin/dashboard-content.tsx
│   │       └── 📄 company-content.tsx                 ← pages/company/dashboard-content.tsx
│   │
│   ├── 📁 academic                                    # Facultades, escuelas, secciones, semestres
│   │   ├── 📁 pages
│   │   │   ├── 📁 faculty
│   │   │   │   ├── 📄 index.tsx
│   │   │   │   └── 📁 partials (create-, update-, delete-faculty-modal.tsx)
│   │   │   ├── 📁 school
│   │   │   │   ├── 📄 index.tsx
│   │   │   │   └── 📁 partials (create-, update-, delete-school-modal.tsx)
│   │   │   ├── 📁 section
│   │   │   │   ├── 📄 index.tsx
│   │   │   │   └── 📁 partials (manage-sections-modal.tsx)
│   │   │   └── 📁 semesters
│   │   │       ├── 📄 index.tsx
│   │   │       └── 📁 partials (back-, close-, update-semester-modal.tsx)
│   │   ├── 📄 types.ts                                ← types/models.ts
│   │   └── 📄 index.ts
│   │
│   ├── 📁 documents                                   # UI de revisión y carga de documentos (la usan 3 módulos)
│   │   ├── 📁 pages
│   │   │   └── 📁 settings
│   │   │       ├── 📄 index.tsx                       ← pages/academic/settings/document
│   │   │       ├── 📁 components (DocumentTypeForm.tsx, DocumentTypeTable.tsx)
│   │   │       └── 📁 hooks (use-document.ts)
│   │   ├── 📁 components
│   │   │   ├── 📄 AlertHelp.tsx                       ← components/document
│   │   │   ├── 📄 DocumentViewer.tsx
│   │   │   ├── 📄 FileHistory.tsx
│   │   │   ├── 📄 FilePreview.tsx
│   │   │   ├── 📄 UploadZone.tsx
│   │   │   ├── 🗑️ detail-validation-form.tsx          # duplicado de validation-form, handlers vacíos
│   │   │   ├── 📄 detail-header.tsx                   ← components/academic
│   │   │   ├── 📄 requirements-list.tsx
│   │   │   ├── 📄 submission-form.tsx
│   │   │   ├── 📄 submission-panel.tsx
│   │   │   ├── 📄 validation-form.tsx
│   │   │   ├── 📄 validation-panel.tsx
│   │   │   └── 🗑️ status-form.tsx                     # sin uso
│   │   └── 📄 index.ts                                # exporta lo que dossier/internship/supervision pueden usar
│   │
│   ├── 📁 dossier
│   │   ├── 📁 pages
│   │   │   ├── 📁 submission (index.tsx, 🗑️ FileDetailsContent.tsx)
│   │   │   └── 📁 validation (index.tsx)
│   │   ├── 📁 components (dossier-detail-panel.tsx, dossier-table.tsx)
│   │   ├── 📁 hooks (use-dossier-validation.ts)
│   │   └── 📄 index.ts
│   │
│   ├── 📁 internship
│   │   ├── 📁 pages
│   │   │   ├── 📁 submission
│   │   │   │   ├── 📄 internshipIndex.tsx
│   │   │   │   ├── 📄 placementIndex.tsx
│   │   │   │   ├── 📁 components (company-form.tsx, document-form.tsx, type-selector.tsx)
│   │   │   │   ├── 📁 hooks (use-internship-submission.tsx, use-placement-submission.tsx)
│   │   │   │   ├── 📁 parts (DocumentViewerPanel.tsx, EvaluationView.tsx, RequirementListPanel.tsx)
│   │   │   │   └── 📁 schemas (detail.schema.ts)
│   │   │   ├── 📁 validation
│   │   │   │   ├── 📄 index.tsx
│   │   │   │   ├── 📁 hooks (use-validation.ts)
│   │   │   │   └── 📁 partials (internship-detail.tsx, placement-detail.tsx, request-grade-change-modal.tsx, pending-grade-change-modal.tsx)
│   │   │   └── 📁 settings
│   │   │       ├── 📄 index.tsx
│   │   │       ├── 📄 types.ts
│   │   │       ├── 📄 useDragSort.ts
│   │   │       ├── 📄 useWorkflow.ts
│   │   │       └── 📁 components (BuilderCard, EvaluationCard, JsonPreview, RequirementColumn, StepperPreview .tsx)
│   │   │   # 🗑️ pages/academic/settings/internship.tsx y hooks/use-student-group.ts están vacíos
│   │   └── 📄 index.ts
│   │
│   ├── 📁 supervision                                 # Supervisión + grupos
│   │   ├── 📁 pages
│   │   │   ├── 📁 submission (index.tsx, components/SubmitForm.tsx)
│   │   │   ├── 📁 validation (index.tsx)
│   │   │   ├── 📁 student (index.tsx)
│   │   │   └── 📁 groups
│   │   │       ├── 📁 internship                      ← pages/academic/group/internship
│   │   │       │   ├── 📄 index.tsx
│   │   │       │   └── 📁 partials (create-, edit-, delete-group-modal.tsx, store.schema.ts, update.schema.ts)
│   │   │       ├── 📁 student                         ← pages/academic/group/student
│   │   │       │   ├── 📄 index.tsx
│   │   │       │   └── 📁 partials (student-management-tabs.tsx)
│   │   │       └── 📁 supervision                     ← pages/academic/group/supervision
│   │   │           ├── 📄 index.tsx
│   │   │           └── 📁 hooks (use-group-supervision.ts)
│   │   ├── 📁 components
│   │   │   ├── 📄 supervision-detail-panel.tsx
│   │   │   ├── 📄 supervision-table.tsx
│   │   │   ├── 📄 group-selector.tsx                  ← components/academic
│   │   │   ├── 📄 module-selector.tsx                 ← components/academic
│   │   │   └── 📄 student-selector-table.tsx          ← pages/academic/group/components
│   │   ├── 📁 hooks
│   │   │   ├── 📄 use-supervision.ts
│   │   │   ├── 📄 use-internship-group.ts
│   │   │   └── 📄 use-student-management.ts
│   │   ├── 📄 types.ts                                ← types/data.tsx
│   │   └── 📄 index.ts
│   │
│   ├── 📁 resources
│   │   ├── 📁 pages
│   │   │   ├── 📄 index.tsx                           ← pages/resource.tsx (despachador por tipo de usuario)
│   │   │   ├── 📄 academic-resource-content.tsx       ← pages/academic/resource/resource-content.tsx
│   │   │   └── 📁 partials (create-resource-sheet, edit-resource-sheet, delete-resource-alert, location-selector .tsx)
│   │   └── 📄 index.ts
│   │
│   ├── 📁 notifications
│   │   ├── 📁 pages
│   │   │   └── 📄 index.tsx                           ← pages/notification.tsx
│   │   ├── 📁 components
│   │   │   └── 📄 notification-dropdown.tsx
│   │   ├── 📁 config
│   │   │   └── 📄 notification.tsx                    ← config/notification.tsx
│   │   └── 📄 index.ts
│   │
│   ├── 📁 company
│   │   ├── 📁 pages
│   │   │   ├── 📄 register.tsx                        ✏️ hoy es solo diseño: falta conectarlo al backend
│   │   │   ├── 📄 resource-content.tsx                # ⚠️ placeholder
│   │   │   └── 🆕 📁 approval                         # pantalla admin para aprobar empresas
│   │   └── 📄 index.ts
│   │
│   └── 📁 jobboard                                    # 🆕 Bolsa laboral
│       ├── 📁 pages
│       │   ├── 🆕 📁 public
│       │   │   ├── 🆕 📄 index.tsx                    # listado público de vacantes
│       │   │   └── 🆕 📄 show.tsx
│       │   ├── 🆕 📁 company
│       │   │   ├── 🆕 📄 vacancies.tsx
│       │   │   ├── 🆕 📄 vacancy-form.tsx
│       │   │   └── 🆕 📄 applications.tsx
│       │   └── 🆕 📁 student
│       │       ├── 🆕 📄 index.tsx                    # explorar y postular
│       │       └── 🆕 📄 my-applications.tsx
│       ├── 📁 components
│       │   ├── 🆕 📄 vacancy-card.tsx
│       │   ├── 🆕 📄 vacancy-filters.tsx
│       │   ├── 🆕 📄 application-status-badge.tsx
│       │   └── 🆕 📄 apply-dialog.tsx
│       ├── 📁 hooks
│       │   └── 🆕 📄 use-vacancy-list.ts
│       ├── 📁 schemas
│       │   └── 🆕 📄 vacancy.schema.ts                # Zod
│       ├── 🆕 📄 types.ts
│       └── 🆕 📄 index.ts

---

### Nota: resolver de páginas (`app.tsx` / `ssr.tsx`)

Laravel nombra cada página como `'<módulo>/<ruta dentro de pages>'` y el frontend la
busca en `resources/js/modules/<módulo>/pages/<ruta>.tsx`
(ver `shared/lib/inertia.ts`):

| `Inertia::render(...)`        | Archivo                                               |
| ----------------------------- | ----------------------------------------------------- |
| `'public/landing'`            | `modules/public/pages/landing.tsx`                    |
| `'identity/auth/login'`       | `modules/identity/pages/auth/login.tsx`               |
| `'dashboard/dashboard'`       | `modules/dashboard/pages/dashboard.tsx`               |
| `'academic/faculty/index'`    | `modules/academic/pages/faculty/index.tsx`            |
| `'supervision/groups/student/index'` | `modules/supervision/pages/groups/student/index.tsx` |

Reglas:

- Al crear una página nueva, se usa ese mismo nombre en el controlador; no hay que
  registrar alias.
- `resources/views/app.blade.php` precarga la página con la misma regla.
- Entre módulos se importa por su `index.ts` (`import { ValidationPanel } from '@/modules/documents'`),
  nunca por rutas internas de otro módulo.
- `shared/` no importa de `modules/`. Excepciones actuales: `app-sidebar-header` usa
  `NotificationDropdown` y `academic-filter` usa el tipo `Faculty`.
