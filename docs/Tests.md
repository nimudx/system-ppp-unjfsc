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
│   └── 🆕 📁 JobBoard                                  # flujo empresa → admin → titular
│       ├── 🆕 📄 CompanyIsolationTest.php              # una empresa NO ve ni edita vacantes de otra
│       ├── 🆕 📄 CompanyApprovalTest.php               # empresa sin activar/inactiva no publica
│       ├── 🆕 📄 VacancyStatusTransitionsTest.php      # borrador → revisión → publicada → cerrada + escuelas destino
│       ├── 🆕 📄 EligibilityTest.php                   # titular solo propone estudiantes de su sección
│       ├── 🆕 📄 DuplicateApplicationTest.php          # duplicados + índice único de candidatos
│       ├── 🆕 📄 ApplicationStatusTransitionsTest.php  # estados manuales del candidato y retiro
│       ├── 🆕 📄 PublicListingTest.php                 # v1 sin listado público; rutas internas protegidas
│       ├── 🆕 📄 NewBadgeTest.php                      # "Nuevo" desaparece tras abrir el detalle
│       ├── 🆕 📄 NotificationsTest.php                 # destinatarios y avisos del módulo
│       ├── 🆕 📄 SubadminScopeTest.php                 # subadmin limitado a su facultad
│       ├── 🆕 📄 AdminTeacherScreensSmokeTest.php
│       └── 🆕 📄 CompanyScreensSmokeTest.php
├── 🆕 📁 Support
│   └── 🆕 📄 JobBoardFixtures.php                      # helpers compartidos de las pruebas JobBoard
└── 📁 Unit
    └── 🗑️ ExampleTest.php