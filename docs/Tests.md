📁 tests
├── 📄 Pest.php
├── 📄 TestCase.php
├── 📁 Feature
│   ├── 📁 Auth            (existentes: Authentication, EmailVerification, PasswordConfirmation, PasswordReset, Registration, TwoFactorChallenge, VerificationNotification)
│   ├── 📁 Settings        (existentes: PasswordUpdate, ProfileUpdate, TwoFactorAuthentication)
│   ├── 📄 DashboardTest.php
│   ├── 🗑️ ExampleTest.php
│   ├── 🆕 📁 Identity     # AssignmentAccessTest, SharedDataTest
│   ├── 🆕 📁 Registration # roles permitidos por rol, facultad, sección, duplicados, carga masiva
│   ├── 🆕 📁 Academic     # cierre y retroceso de semestre
│   ├── 🆕 📁 Dossier      # aprobación completa habilita la asignación
│   ├── 🆕 📁 Internship   # placement → validación → creación de internship, avance de etapas
│   ├── 🆕 📁 Supervision  # grupos, un supervisor por grupo activo, evaluaciones
│   ├── 🆕 📁 Documents    # tamaño, tipo, URL firmada, acceso a archivos ajenos
│   └── 🆕 📁 JobBoard
│       ├── 🆕 📄 CompanyIsolationTest.php             # una empresa NO ve ni edita vacantes de otra
│       ├── 🆕 📄 DuplicateApplicationTest.php         # índice único + excepción de negocio
│       ├── 🆕 📄 EligibilityTest.php
│       ├── 🆕 📄 VacancyStatusTransitionsTest.php
│       ├── 🆕 📄 ApplicationStatusTransitionsTest.php
│       ├── 🆕 📄 PublicListingTest.php                # solo campos no sensibles + throttle + caché
│       └── 🆕 📄 CompanyApprovalTest.php              # empresa pendiente no puede publicar
└── 📁 Unit
    ├── 🗑️ ExampleTest.php
    └── 🆕 📁 JobBoard     # enums y reglas de transición