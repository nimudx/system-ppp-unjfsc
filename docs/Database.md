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