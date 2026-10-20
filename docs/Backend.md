📁 system-ppp-unjfsc
├── 📁 app
│   │
│   ├── 📁 Shared                                      # Solo lo transversal
│   │   ├── 📁 Concerns
│   │   │   ├── 🐘 PasswordValidationRules.php         ← app/Concerns
│   │   │   └── 🐘 ProfileValidationRules.php          ← app/Concerns
│   │   ├── 📁 Enums
│   │   │   ├── 🐘 GeneralStatus.php                   ← app/Enums
│   │   │   └── 🐘 Role.php                            ← app/Enums (lo usan middleware y varios módulos)
│   │   ├── 📁 Exceptions
│   │   │   ├── 🐘 BusinessException.php               ← app/Exceptions
│   │   │   └── 🐘 ResourceNotFoundException.php       ← app/Exceptions
│   │   ├── 📁 Http
│   │   │   └── 📁 Middleware
│   │   │       ├── 🐘 EnsureActiveSemester.php        ← app/Http/Middleware
│   │   │       ├── 🐘 EnsureAssignmentAccess.php      ← app/Http/Middleware
│   │   │       ├── 🐘 EnsureHasRole.php               ← app/Http/Middleware
│   │   │       ├── 🐘 EnsureUserType.php              ← app/Http/Middleware
│   │   │       ├── 🐘 HandleAppearance.php            ← app/Http/Middleware
│   │   │       └── 🐘 HandleInertiaRequests.php       ← app/Http/Middleware
│   │   └── 📁 Support
│   │       └── 🆕 🐘 ModuleRouteRegistrar.php         # Carga routes/web.php y routes/api.php de cada dominio
│   │
│   ├── 📁 Domains
│   │   │
│   │   ├── 📁 Identity                                # Person, User, Assignment, perfiles, 2FA
│   │   │   ├── 📁 Actions
│   │   │   │   ├── 🐘 CreateNewUser.php               ✏️ ← app/Actions/Fortify (⚠️ usa authenticable_*, columnas que ya no existen)
│   │   │   │   └── 🐘 ResetUserPassword.php           ← app/Actions/Fortify
│   │   │   ├── 📁 Enums
│   │   │   │   ├── 🐘 PersonStatus.php                ← app/Enums
│   │   │   │   ├── 🐘 AssignmentAccessStatus.php      ← app/Enums/Assignment
│   │   │   │   ├── 🐘 AssignmentApprovalStatus.php    ← app/Enums/Assignment
│   │   │   │   ├── 🐘 AssignmentReviewStatus.php      ← app/Enums/Assignment
│   │   │   │   └── 🐘 AssignmentStatus.php            ← app/Enums/Assignment
│   │   │   ├── 📁 Exceptions
│   │   │   │   └── 🐘 AssignmentNotAllowedException.php  ← app/Exceptions/Assignment
│   │   │   ├── 📁 Http
│   │   │   │   ├── 📁 Controllers
│   │   │   │   │   ├── 🐘 AcademicSessionController.php   ← app/Http/Controllers
│   │   │   │   │   ├── 🐘 UserAssignmentController.php    ← app/Http/Controllers
│   │   │   │   │   └── 📁 Settings
│   │   │   │   │       ├── 🐘 PasswordController.php
│   │   │   │   │       ├── 🐘 ProfileController.php
│   │   │   │   │       ├── 🐘 ProfileDetailsController.php
│   │   │   │   │       ├── 🐘 ProfileMediaController.php
│   │   │   │   │       └── 🐘 TwoFactorAuthenticationController.php
│   │   │   │   └── 📁 Requests
│   │   │   │       ├── 🐘 StoreAssignmentManageRequest.php  ← Requests/Assignment
│   │   │   │       ├── 🐘 PasswordUpdateRequest.php         ← Requests/Settings
│   │   │   │       ├── 🐘 ProfileDeleteRequest.php
│   │   │   │       ├── 🐘 ProfileDetailsUpdateRequest.php
│   │   │   │       ├── 🐘 ProfileMediaUpdateRequest.php
│   │   │   │       ├── 🐘 ProfileUpdateRequest.php
│   │   │   │       └── 🐘 TwoFactorAuthenticationRequest.php
│   │   │   ├── 📁 Models
│   │   │   │   ├── 🐘 Assignment.php
│   │   │   │   ├── 🐘 Person.php
│   │   │   │   ├── 🐘 Role.php
│   │   │   │   ├── 🐘 TypeUser.php
│   │   │   │   └── 🐘 User.php
│   │   │   ├── 📁 Policies
│   │   │   │   └── 🆕 🐘 AssignmentPolicy.php
│   │   │   ├── 📁 Services
│   │   │   │   ├── 🐘 AssignmentService.php           ← app/Services
│   │   │   │   ├── 🐘 UserAssignmentService.php       ← app/Services
│   │   │   │   ├── 🐘 SharedDataService.php           ← Services/Auth
│   │   │   │   ├── 🐘 SyncAcademicSessionService.php  ← Services/Auth
│   │   │   │   ├── 🐘 ProfileDetailsService.php       ← Services/Settings
│   │   │   │   └── 🐘 ProfileMediaService.php         ✏️ ← Services/Settings (mover fotos a disco privado)
│   │   │   ├── 📁 Contracts
│   │   │   │   └── 🆕 🐘 CurrentAssignmentResolver.php   # Interfaz: "¿cuál es la asignación activa?"
│   │   │   ├── 📁 routes
│   │   │   │   ├── 🐘 web.php                         ← routes/settings.php + parte de routes/user.php
│   │   │   │   └── 🐘 api.php
│   │   │   └── 📁 Providers
│   │   │       └── 🐘 FortifyServiceProvider.php      ← app/Providers
│   │   │
│   │   ├── 📁 Registration                            # Alta individual y masiva de usuarios
│   │   │   ├── 📁 Exceptions                          ← app/Exceptions/Registration
│   │   │   │   ├── 🐘 RegistrationAssignmentsMustBelongToSameFacultyException.php
│   │   │   │   ├── 🐘 RegistrationFacultyNotAllowedException.php
│   │   │   │   ├── 🐘 RegistrationNotAllowedException.php
│   │   │   │   ├── 🐘 RegistrationRoleNotAllowedException.php
│   │   │   │   ├── 🐘 RegistrationSectionNotAllowedException.php
│   │   │   │   ├── 🐘 UserAlreadyAssignedInSemesterException.php
│   │   │   │   ├── 🐘 UserAlreadyRegisteredInSectionException.php
│   │   │   │   └── 🐘 UserCannotBeSupervisorDueToExistingRoleException.php
│   │   │   ├── 📁 Http
│   │   │   │   ├── 📁 Controllers
│   │   │   │   │   └── 🐘 UserRegistrationController.php
│   │   │   │   └── 📁 Requests
│   │   │   │       ├── 🐘 StepOneRequest.php
│   │   │   │       ├── 🐘 StepTwoRequest.php
│   │   │   │       ├── 🐘 StepThreeRequest.php
│   │   │   │       └── 🐘 StorePersonMassiveRequest.php   ✏️ quitar mensaje 'WAAA'
│   │   │   ├── 📁 Services
│   │   │   │   └── 🐘 UserRegistrationService.php     # ⚠️ registerUserCompany() debería vivir en Company
│   │   │   └── 📁 routes
│   │   │       ├── 🐘 web.php
│   │   │       └── 🐘 api.php
│   │   │
│   │   ├── 📁 Academic                                # Facultades, escuelas, secciones, semestres
│   │   │   ├── 📁 Enums
│   │   │   │   └── 🐘 SemesterStatus.php              ← app/Enums/Academic
│   │   │   ├── 📁 Exceptions
│   │   │   │   ├── 🐘 SectionHasRelatedRecordsException.php   ← Exceptions/Section
│   │   │   │   ├── 🐘 SemesterHasRelatedRecordsException.php  ← Exceptions/Semester
│   │   │   │   ├── 🐘 SemesterInvalidCodeException.php
│   │   │   │   ├── 🐘 SemesterPreviousNotFoundException.php
│   │   │   │   └── 🐘 SemesterRollbackNotAllowedException.php
│   │   │   ├── 📁 Http
│   │   │   │   ├── 📁 Controllers
│   │   │   │   │   ├── 🐘 FacultyController.php
│   │   │   │   │   ├── 🐘 SchoolController.php
│   │   │   │   │   ├── 🐘 SectionController.php
│   │   │   │   │   └── 🐘 SemesterController.php
│   │   │   │   └── 📁 Requests
│   │   │   │       ├── 🐘 FacultyRequest.php
│   │   │   │       ├── 🐘 SchoolRequest.php
│   │   │   │       ├── 🐘 StoreSectionRequest.php
│   │   │   │       ├── 🐘 UpdateSemesterRequest.php
│   │   │   │       ├── 🗑️ StoreFacultyRequest.php      # duplicado de FacultyRequest
│   │   │   │       ├── 🗑️ UpdateSchoolRequest.php      # no se usa
│   │   │   │       ├── 🗑️ UpdateSectionRequest.php     # usa regla inexistente 'foreign:'
│   │   │   │       └── 🗑️ CloseSemesterRequest.php     # authorize() = false, sin uso
│   │   │   ├── 📁 Models
│   │   │   │   ├── 🐘 Faculty.php
│   │   │   │   ├── 🐘 School.php
│   │   │   │   ├── 🐘 Section.php
│   │   │   │   └── 🐘 Semester.php
│   │   │   ├── 📁 Policies
│   │   │   │   └── 🆕 🐘 AcademicStructurePolicy.php
│   │   │   ├── 📁 Services
│   │   │   │   ├── 🐘 FacultyService.php
│   │   │   │   ├── 🐘 SchoolService.php
│   │   │   │   ├── 🐘 SectionService.php
│   │   │   │   └── 🐘 SemesterService.php             ✏️ quitar `use Cassandra\Collection` (import erróneo)
│   │   │   ├── 📁 Contracts
│   │   │   │   └── 🆕 🐘 ActiveSemesterProvider.php   # Otros módulos piden el semestre activo por aquí
│   │   │   └── 📁 routes
│   │   │       └── 🐘 web.php                         ← routes/academic/general.php
│   │   │
│   │   ├── 📁 Documents                               # Document, DocumentType y almacenamiento
│   │   │   ├── 📁 Exceptions
│   │   │   │   ├── 🐘 DocumentAlreadyApprovedException.php
│   │   │   │   ├── 🐘 DocumentInvalidContextException.php
│   │   │   │   └── 🐘 DocumentSizeLimitException.php
│   │   │   ├── 📁 Http
│   │   │   │   ├── 📁 Controllers
│   │   │   │   │   ├── 🐘 DocumentController.php      ✏️ quitar fallback User::first()
│   │   │   │   │   └── 🐘 DocumentSettingController.php   ← Academic/Settings
│   │   │   │   └── 📁 Requests
│   │   │   │       ├── 🐘 UpdateDocumentStatusRequest.php
│   │   │   │       └── 🐘 UploadDocumentRequest.php
│   │   │   ├── 📁 Models
│   │   │   │   ├── 🐘 Document.php
│   │   │   │   └── 🐘 DocumentType.php
│   │   │   ├── 📁 Services
│   │   │   │   └── 🐘 DocumentService.php             ✏️ 🔒 guardar en disco 'private', semestre dinámico (hoy "2026-1" fijo)
│   │   │   ├── 📁 Contracts
│   │   │   │   └── 🆕 🐘 DocumentStorage.php          # Interfaz pública para subir/leer/eliminar
│   │   │   ├── 📁 Http/Controllers
│   │   │   │   └── 🆕 🐘 SignedDocumentController.php # 🔒 sirve archivos con URL firmada
│   │   │   └── 📁 routes
│   │   │       ├── 🐘 web.php
│   │   │       └── 🐘 api.php
│   │   │
│   │   ├── 📁 Dossier                                 # Expediente de docentes y estudiantes
│   │   │   ├── 📁 Enums
│   │   │   │   ├── 🐘 DossierApprovalStatus.php
│   │   │   │   └── 🐘 DossierStatus.php
│   │   │   ├── 📁 Http
│   │   │   │   ├── 📁 Controllers
│   │   │   │   │   └── 🐘 DossierController.php       ← Academic/DossierController
│   │   │   │   └── 📁 Requests
│   │   │   │       └── 🐘 UploadDocumentDossierRequest.php
│   │   │   ├── 📁 Models
│   │   │   │   └── 🐘 Dossier.php
│   │   │   ├── 📁 Services
│   │   │   │   └── 🐘 DossierService.php
│   │   │   └── 📁 routes
│   │   │       ├── 🐘 web.php                         ← routes/academic/dossier.php
│   │   │       └── 🐘 api.php
│   │   │
│   │   ├── 📁 Internship                              # Formalización (placement) y seguimiento (internship)
│   │   │   ├── 📁 Contracts
│   │   │   │   └── 🆕 🐘 StudentInternshipStatus.php  # "¿tiene práctica activa?" para JobBoard
│   │   │   ├── 📁 Enums
│   │   │   │   ├── 🆕 🐘 InternshipType.php           # development | validation
│   │   │   │   ├── 🆕 🐘 PlacementOrigin.php          # direct | application
│   │   │   │   └── 🆕 🐘 PlacementApprovalStatus.php  # reemplaza números mágicos 1/2/3
│   │   │   ├── 📁 Exceptions
│   │   │   │   ├── 🐘 InternshipAlreadyActiveException.php
│   │   │   │   ├── 🐘 InternshipNotActiveException.php
│   │   │   │   └── 🐘 InternshipNotFoundException.php  # ⚠️ archivo vacío
│   │   │   ├── 📁 Http
│   │   │   │   ├── 📁 Controllers
│   │   │   │   │   ├── 🐘 InternshipController.php
│   │   │   │   │   ├── 🐘 PlacementController.php
│   │   │   │   │   └── 🐘 InternshipSettingController.php  ← Academic/Settings
│   │   │   │   └── 📁 Requests
│   │   │   │       ├── 🐘 SaveInternshipSettingRequest.php
│   │   │   │       ├── 🐘 StoreGradeInternshipRequest.php
│   │   │   │       ├── 🐘 StoreInternshipRequest.php
│   │   │   │       ├── 🐘 StorePlacementRequest.php
│   │   │   │       ├── 🐘 StoreRequestGradeChangeInternshipRequest.php
│   │   │   │       ├── 🐘 StoreRequestTypeChangeInternshipRequest.php
│   │   │   │       └── 🐘 UploadDocumentInternshipRequest.php
│   │   │   ├── 📁 Models
│   │   │   │   ├── 🐘 Internship.php
│   │   │   │   ├── 🐘 InternshipSetting.php
│   │   │   │   └── 🐘 Placement.php
│   │   │   ├── 📁 Policies
│   │   │   │   └── 🆕 🐘 PlacementPolicy.php
│   │   │   ├── 📁 Services
│   │   │   │   ├── 🐘 InternshipService.php
│   │   │   │   ├── 🐘 InternshipSettingService.php
│   │   │   │   └── 🐘 PlacementService.php
│   │   │   └── 📁 routes
│   │   │       ├── 🐘 web.php                         ← routes/academic/internship.php
│   │   │       └── 🐘 api.php
│   │   │
│   │   ├── 📁 Supervision                             # Grupos de práctica, supervisión y evaluaciones
│   │   │   ├── 📁 Enums
│   │   │   │   └── 🐘 EvaluationApprovalStatus.php
│   │   │   ├── 📁 Exceptions
│   │   │   │   ├── 🐘 EvaluationAlreadyApprovedException.php  ✏️ quitar 'by Marrrr'
│   │   │   │   ├── 🐘 GroupHasStudentsException.php
│   │   │   │   └── 🐘 SupervisorAlreadyAssignedToGroupInSectionException.php
│   │   │   ├── 📁 Http
│   │   │   │   ├── 📁 Controllers
│   │   │   │   │   ├── 🐘 SupervisionController.php
│   │   │   │   │   └── 🐘 InternshipGroupController.php
│   │   │   │   └── 📁 Requests
│   │   │   │       ├── 🐘 AttachStudentsRequest.php   ← Requests/Group
│   │   │   │       ├── 🐘 DetachStudentsRequest.php
│   │   │   │       ├── 🐘 MoveStudentsRequest.php
│   │   │   │       ├── 🐘 StoreGroupRequest.php
│   │   │   │       ├── 🐘 UpdateGroupRequest.php
│   │   │   │       ├── 🐘 StoreEvaluationRequest.php  ← Requests/Supervision
│   │   │   │       └── 🐘 UpdateEvaluationStatusRequest.php
│   │   │   ├── 📁 Models
│   │   │   │   ├── 🐘 Evaluation.php
│   │   │   │   ├── 🐘 InternshipGroup.php
│   │   │   │   ├── 🐘 Module.php
│   │   │   │   ├── 🐘 StudentGroup.php
│   │   │   │   └── 🐘 Supervision.php
│   │   │   ├── 📁 Services
│   │   │   │   ├── 🐘 InternshipGroupService.php
│   │   │   │   └── 🐘 SupervisionService.php
│   │   │   └── 📁 routes
│   │   │       ├── 🐘 web.php                         ← routes/academic/supervision.php + groups.php
│   │   │       └── 🐘 api.php
│   │   │
│   │   ├── 📁 Requests                                # Solicitudes de gestión (cambio de nota, baja de asignación)
│   │   │   ├── 📁 Exceptions
│   │   │   │   └── 🐘 RequestUnsupportedTypeException.php
│   │   │   ├── 📁 Http
│   │   │   │   ├── 📁 Controllers
│   │   │   │   │   └── 🐘 RequestController.php
│   │   │   │   └── 📁 Requests
│   │   │   │       └── 🐘 UpdateManagementRequestStatusRequest.php
│   │   │   ├── 📁 Models
│   │   │   │   └── 🐘 UserRequest.php
│   │   │   ├── 📁 Services
│   │   │   │   └── 🐘 RequestService.php
│   │   │   └── 📁 routes
│   │   │       └── 🐘 web.php                         ← routes/request.php
│   │   │
│   │   ├── 📁 Resources                               # Recursos académicos (manuales, plantillas)
│   │   │   ├── 📁 Http
│   │   │   │   ├── 📁 Controllers
│   │   │   │   │   └── 🐘 ResourceController.php
│   │   │   │   └── 📁 Requests
│   │   │   │       └── 🐘 ResourceRequest.php         ✏️ mensajes 'required' sobran en campos nullable
│   │   │   ├── 📁 Models
│   │   │   │   └── 🐘 Resource.php
│   │   │   ├── 📁 Services
│   │   │   │   └── 🐘 ResourceService.php
│   │   │   └── 📁 routes
│   │   │       └── 🐘 web.php                         ← routes/resource.php
│   │   │
│   │   ├── 📁 Notifications
│   │   │   ├── 📁 Http/Controllers
│   │   │   │   └── 🐘 NotificationController.php
│   │   │   ├── 📁 Models
│   │   │   │   ├── 🐘 Notification.php
│   │   │   │   └── 🐘 NotificationRecipient.php
│   │   │   ├── 📁 Services
│   │   │   │   └── 🐘 NotificationService.php
│   │   │   ├── 📁 Listeners
│   │   │   │   └── 🆕 🐘 SendNotificationOnDomainEvent.php   # Los demás módulos emiten Events, este escucha
│   │   │   └── 📁 routes
│   │   │       └── 🐘 web.php
│   │   │
│   │   ├── 📁 Company                                 # Empresa, áreas, jefes, personal
│   │   │   ├── 📁 Enums
│   │   │   │   └── 🆕 🐘 CompanyApprovalStatus.php    # pending | approved | rejected
│   │   │   ├── 📁 Http
│   │   │   │   ├── 📁 Controllers
│   │   │   │   │   ├── 🆕 🐘 CompanyRegistrationController.php   # público, con throttle
│   │   │   │   │   └── 🆕 🐘 CompanyApprovalController.php       # admin aprueba empresas
│   │   │   │   └── 📁 Requests
│   │   │   │       └── 🐘 StoreCompanyRequest.php     ← Requests/Registration
│   │   │   ├── 📁 Models
│   │   │   │   ├── 🐘 Area.php
│   │   │   │   ├── 🐘 Boss.php
│   │   │   │   ├── 🐘 Company.php
│   │   │   │   ├── 🐘 Position.php
│   │   │   │   └── 🐘 Staff.php
│   │   │   ├── 📁 Policies
│   │   │   │   └── 🆕 🐘 CompanyPolicy.php
│   │   │   ├── 📁 Services
│   │   │   │   └── 🐘 CompanyService.php
│   │   │   ├── 📁 Contracts
│   │   │   │   └── 🆕 🐘 CompanyDirectory.php         # "¿esta empresa está aprobada?" para JobBoard
│   │   │   └── 📁 routes
│   │   │       ├── 🐘 web.php                         ← routes/company/general.php
│   │   │       └── 🐘 api.php
│   │   │
│   │   └── 📁 JobBoard                                # 🆕 Bolsa laboral (módulo nuevo)
│   │       ├── 📁 Actions
│   │       │   ├── 🆕 🐘 CreateVacancy.php
│   │       │   ├── 🆕 🐘 PublishVacancy.php            # invalida caché del listado público
│   │       │   ├── 🆕 🐘 CloseVacancy.php              # invalida caché del listado público
│   │       │   ├── 🆕 🐘 ApplyToVacancy.php            # traduce violación del índice único a excepción de negocio
│   │       │   └── 🆕 🐘 ChangeApplicationStatus.php
│   │       ├── 📁 Contracts
│   │       │   └── 🆕 🐘 VacancyCatalog.php            # API pública del módulo
│   │       ├── 📁 Enums
│   │       │   ├── 🆕 🐘 VacancyStatus.php             # draft | published | closed
│   │       │   ├── 🆕 🐘 VacancyModality.php           # presencial | remoto | híbrido
│   │       │   └── 🆕 🐘 ApplicationStatus.php         # pending | accepted | rejected | withdrawn
│   │       ├── 📁 Events
│   │       │   ├── 🆕 🐘 VacancyPublished.php
│   │       │   ├── 🆕 🐘 VacancyClosed.php
│   │       │   ├── 🆕 🐘 ApplicationSubmitted.php
│   │       │   └── 🆕 🐘 ApplicationStatusChanged.php
│   │       ├── 📁 Exceptions
│   │       │   ├── 🆕 🐘 AlreadyAppliedException.php
│   │       │   ├── 🆕 🐘 VacancyNotOpenException.php
│   │       │   ├── 🆕 🐘 CompanyNotApprovedException.php
│   │       │   └── 🆕 🐘 StudentNotEligibleException.php
│   │       ├── 📁 Http
│   │       │   ├── 📁 Controllers
│   │       │   │   ├── 🆕 🐘 PublicVacancyController.php     # listado público (throttle + caché)
│   │       │   │   ├── 🆕 🐘 CompanyVacancyController.php    # CRUD de la empresa (filtra por company_id)
│   │       │   │   ├── 🆕 🐘 StudentApplicationController.php
│   │       │   │   └── 🆕 🐘 CompanyApplicationController.php
│   │       │   ├── 📁 Requests
│   │       │   │   ├── 🆕 🐘 StoreVacancyRequest.php
│   │       │   │   ├── 🆕 🐘 UpdateVacancyRequest.php
│   │       │   │   ├── 🆕 🐘 ApplyToVacancyRequest.php
│   │       │   │   └── 🆕 🐘 ChangeApplicationStatusRequest.php
│   │       │   └── 📁 Resources
│   │       │       └── 🆕 🐘 PublicVacancyResource.php       # solo campos no sensibles
│   │       ├── 📁 Jobs
│   │       │   ├── 🆕 🐘 NotifyCompanyOfApplication.php      # cola, nunca dentro del request
│   │       │   └── 🆕 🐘 NotifyStudentOfStatusChange.php
│   │       ├── 📁 Models
│   │       │   ├── 🆕 🐘 Vacancy.php
│   │       │   ├── 🆕 🐘 VacancySchool.php                   # pivote vacante ↔ escuela
│   │       │   └── 🆕 🐘 Application.php
│   │       ├── 📁 Policies
│   │       │   ├── 🆕 🐘 VacancyPolicy.php
│   │       │   └── 🆕 🐘 ApplicationPolicy.php
│   │       ├── 📁 Services
│   │       │   ├── 🆕 🐘 VacancyQueryService.php             # listados + Cache::remember
│   │       │   └── 🆕 🐘 EligibilityService.php              # reglas de elegibilidad del estudiante
│   │       └── 📁 routes
│   │           ├── 🆕 🐘 web.php
│   │           └── 🆕 🐘 api.php
│   │
│   ├── 📁 Providers
│   │   ├── 🐘 AppServiceProvider.php                  ✏️ añadir Relation::enforceMorphMap([...])
│   │   ├── 🆕 🐘 DomainServiceProvider.php            # registra rutas, policies, listeners y bindings de Contracts
│   │   └── 🐘 FortifyServiceProvider.php              → se mueve a Domains/Identity/Providers
│   │
│   └── 📁 Console
│       └── 🆕 📁 Commands
│           └── 🆕 🐘 ExpirePendingVacancies.php         # cierra vacantes vencidas (scheduler)
│
├── 📁 bootstrap
│   ├── 🐘 app.php                                     ✏️ registrar DomainServiceProvider y middleware
│   └── 🐘 providers.php
│
├── 📁 config
│   ├── 🐘 app.php
│   ├── 🐘 auth.php
│   ├── 🐘 cache.php
│   ├── 🐘 database.php
│   ├── 🐘 filesystems.php                             ✏️ 🔒 disco 'private' (local, sin URL pública)
│   ├── 🐘 fortify.php
│   ├── 🐘 inertia.php
│   ├── 🐘 logging.php
│   ├── 🐘 mail.php
│   ├── 🐘 queue.php
│   ├── 🐘 sanctum.php                                 # ⚠️ confirmar si se usa; si no, quitar
│   ├── 🐘 services.php
│   ├── 🐘 session.php
│   └── 🆕 🐘 jobboard.php                             # límites, días de vigencia, TTL de caché
│
└── 📁 routes
    ├── 🐘 web.php                                     ✏️ solo rutas globales; el resto lo carga DomainServiceProvider
    ├── 🐘 api.php                                     ✏️ idem
    └── 🐘 console.php                                 ✏️ scheduler (ExpirePendingVacancies, limpieza)