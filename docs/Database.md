```
📁 database
├── 📁 factories
│   ├── 🐘 PersonFactory.php
│   ├── 🐘 UserFactory.php
│   └── 🆕 🐘 VacancyFactory.php, ApplicationFactory.php, CompanyFactory.php
├── 📁 migrations
│   ├── 🐘 2026_02_19_* … 2026_04_10_*                 # existentes: NO tocar
│   ├── ⚠️ 2026_03_29_042545_create_staffs_table.php.php   # extensión doble: no renombrar si ya se ejecutó
│   ├── ⚠️ 2026_03_29_042604_create_areas_table.php.php    # idem
│   │
│   ├── 🆕 2026_10_20_000001_fix_unique_indexes_core_tables.php
│   │       # student_groups (student_assignment_id, internship_group_id) único
│   │       # supervisions (assignment_id, module_id) único
│   │       # document_type_roles (document_type_id, role_id) único
│   │       # companies.ruc único (+ email único)
│   ├── 🆕 2026_10_20_000002_add_performance_indexes.php
│   │       # resources (role_id, semester_id, status, level)
│   │       # documents (document_type_id)
│   ├── 🆕 2026_10_20_000003_change_evaluations_grade_to_decimal.php
│   ├── 🆕 2026_10_20_000004_restrict_on_delete_documents_and_resources.php
│   ├── 🆕 2026_10_20_000005_add_approval_status_to_companies.php
│   ├── 🆕 2026_10_20_000006_adjust_vacancies_table.php    # solo si la tabla existente no cumple el diseño
│   ├── 🆕 2026_10_20_000007_adjust_applications_table.php # índice único (vacancy_id, person_id)
│   ├── 🆕 2026_10_20_000008_add_vacancy_indexes.php       # vacancies(status, semester_id), applications(vacancy_id, status)
│   └── 🆕 2026_11_xx_000009_drop_sections_faculty_id.php  # ⚠️ último, solo tras unificar consultas y tener tests
├── 📁 seeders
│   ├── 🐘 Cycle2026Seeder.php
│   ├── 🐘 DatabaseSeeder.php
│   ├── 🐘 DocumentTypeRoleSeeder.php
│   ├── 🐘 RoleSeeder.php
│   ├── 🐘 TypeUserSeeder.php
│   └── 🆕 🐘 JobBoardDemoSeeder.php                    # solo para entornos local/staging
└── ⚙️ .gitignore
```

## Bolsa laboral (JobBoard)

Migraciones del módulo (no modifican las migraciones heredadas):

| Migración | Contenido |
|---|---|
| `2026_11_08_000001_create_vacancy_candidates_table.php` | Propuestas de candidatos hechas por el docente titular. |
| `2026_11_08_000002_create_vacancy_views_table.php` | Vistas por usuario para calcular la etiqueta "Nuevo". |
| `2026_11_08_000003_extend_vacancies_table.php` | Diferencial de `vacancies`: tipo, modalidad, área, ubicación, posiciones, requisitos, fecha límite, revisión, publicación y cierre. |
| `2026_11_08_000004_add_unique_vacancy_schools.php` | Único `(vacancy_id, school_id)` en escuelas destino. |

### `vacancies` (extendida)

- `company_id` → `companies` (FK).
- `semester_id` → `semesters` (FK nullable, solo reporte).
- `title`, `description` (nullable), `type` (`practicas|empleo`), `modality`
  (`presencial|remoto|hibrido`), `area_name`, `location`, `positions_count`,
  `requirements`, `deadline_at`.
- `status` (`draft|pending_review|observed|rejected|published|closed`).
- `review_comment`, `reviewed_by_assignment_id` (FK nullable), `reviewed_at`,
  `published_at`, `closed_at`, `closed_reason` (`filled|expired|withdrawn`).
- Las columnas heredadas `staff_id`, `start_date` y `end_date` pasan a nullable.
- Índices: `(status, semester_id)` y `(company_id, status)`.

### `vacancy_schools`

- `vacancy_id` (FK, cascade), `school_id` (FK, cascade), `status`.
- Único `(vacancy_id, school_id)`.

### `vacancy_candidates`

- `vacancy_id` (FK, cascade).
- `student_assignment_id` (FK a `assignments`, restrictOnDelete).
- `proposed_by_assignment_id` (FK a `assignments`, restrictOnDelete).
- `note` (max. 500), `status` (`proposed|contacted|hired|discarded`),
  `status_note` (max. 500), timestamps.
- Único `(vacancy_id, student_assignment_id)` e índice `(vacancy_id, status)`.
- La violación del único se traduce a `CandidateAlreadyProposed` (409).

### `vacancy_views`

- `vacancy_id` (FK, cascade), `user_id` (FK, cascade), `seen_at`, timestamps.
- Único `(vacancy_id, user_id)`.

### Notas

- La tabla heredada `applications` **no se usa** en el flujo v1 (selección por
  docente titular). Se conserva por compatibilidad histórica.
- `Vacancy` y `VacancyCandidate` están registrados en el morph map de
  `AppServiceProvider` como `vacancy` y `vacancy_candidate` para las
  notificaciones.
- La etiqueta "Nuevo" se calcula con `vacancy_views` +
  `config('jobboard.new_days')` (14 días por defecto).