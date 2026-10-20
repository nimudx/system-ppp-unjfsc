# File Tree: system-ppp-unjfsc

**Generated:** 10/19/2026, 12:53:31 PM
**Root Path:** `c:\Users\jeans\Desktop\system-ppp-unjfsc`

```
├── 📁 .github
│   └── 📁 workflows
│       ├── ⚙️ deploy.yml
│       ├── ⚙️ lint.yml
│       └── ⚙️ tests.yml
├── 📁 app
│   ├── 📁 Actions
│   │   └── 📁 Fortify
│   │       ├── 🐘 CreateNewUser.php
│   │       └── 🐘 ResetUserPassword.php
│   ├── 📁 Concerns
│   │   ├── 🐘 PasswordValidationRules.php
│   │   └── 🐘 ProfileValidationRules.php
│   ├── 📁 Enums
│   │   ├── 📁 Academic
│   │   │   └── 🐘 SemesterStatus.php
│   │   ├── 📁 Assignment
│   │   │   ├── 🐘 AssignmentAccessStatus.php
│   │   │   ├── 🐘 AssignmentApprovalStatus.php
│   │   │   ├── 🐘 AssignmentReviewStatus.php
│   │   │   └── 🐘 AssignmentStatus.php
│   │   ├── 📁 Dossier
│   │   │   ├── 🐘 DossierApprovalStatus.php
│   │   │   └── 🐘 DossierStatus.php
│   │   ├── 📁 Supervision
│   │   │   └── 🐘 EvaluationApprovalStatus.php
│   │   ├── 🐘 GeneralStatus.php
│   │   ├── 🐘 PersonStatus.php
│   │   └── 🐘 Role.php
│   ├── 📁 Exceptions
│   │   ├── 📁 Assignment
│   │   │   └── 🐘 AssignmentNotAllowedException.php
│   │   ├── 📁 Document
│   │   │   ├── 🐘 DocumentAlreadyApprovedException.php
│   │   │   ├── 🐘 DocumentInvalidContextException.php
│   │   │   └── 🐘 DocumentSizeLimitException.php
│   │   ├── 📁 Group
│   │   │   ├── 🐘 GroupHasStudentsException.php
│   │   │   └── 🐘 SupervisorAlreadyAssignedToGroupInSectionException.php
│   │   ├── 📁 Internship
│   │   │   ├── 🐘 InternshipAlreadyActiveException.php
│   │   │   ├── 🐘 InternshipNotActiveException.php
│   │   │   └── 🐘 InternshipNotFoundException.php
│   │   ├── 📁 Registration
│   │   │   ├── 🐘 RegistrationAssignmentsMustBelongToSameFacultyException.php
│   │   │   ├── 🐘 RegistrationFacultyNotAllowedException.php
│   │   │   ├── 🐘 RegistrationNotAllowedException.php
│   │   │   ├── 🐘 RegistrationRoleNotAllowedException.php
│   │   │   ├── 🐘 RegistrationSectionNotAllowedException.php
│   │   │   ├── 🐘 UserAlreadyAssignedInSemesterException.php
│   │   │   ├── 🐘 UserAlreadyRegisteredInSectionException.php
│   │   │   └── 🐘 UserCannotBeSupervisorDueToExistingRoleException.php
│   │   ├── 📁 Section
│   │   │   └── 🐘 SectionHasRelatedRecordsException.php
│   │   ├── 📁 Semester
│   │   │   ├── 🐘 SemesterHasRelatedRecordsException.php
│   │   │   ├── 🐘 SemesterInvalidCodeException.php
│   │   │   ├── 🐘 SemesterPreviousNotFoundException.php
│   │   │   └── 🐘 SemesterRollbackNotAllowedException.php
│   │   ├── 🐘 BusinessException.php
│   │   ├── 🐘 EvaluationAlreadyApprovedException.php
│   │   ├── 🐘 RequestUnsupportedTypeException.php
│   │   └── 🐘 ResourceNotFoundException.php
│   ├── 📁 Http
│   │   ├── 📁 Controllers
│   │   │   ├── 📁 Academic
│   │   │   │   ├── 📁 Settings
│   │   │   │   │   ├── 🐘 DocumentSettingController.php
│   │   │   │   │   └── 🐘 InternshipSettingController.php
│   │   │   │   ├── 🐘 DossierController.php
│   │   │   │   ├── 🐘 FacultyController.php
│   │   │   │   ├── 🐘 InternshipController.php
│   │   │   │   ├── 🐘 InternshipGroupController.php
│   │   │   │   ├── 🐘 PlacementController.php
│   │   │   │   ├── 🐘 SchoolController.php
│   │   │   │   ├── 🐘 SectionController.php
│   │   │   │   ├── 🐘 SemesterController.php
│   │   │   │   └── 🐘 SupervisionController.php
│   │   │   ├── 📁 Registration
│   │   │   │   └── 🐘 UserRegistrationController.php
│   │   │   ├── 📁 Settings
│   │   │   │   ├── 🐘 PasswordController.php
│   │   │   │   ├── 🐘 ProfileController.php
│   │   │   │   ├── 🐘 ProfileDetailsController.php
│   │   │   │   ├── 🐘 ProfileMediaController.php
│   │   │   │   └── 🐘 TwoFactorAuthenticationController.php
│   │   │   ├── 🐘 AcademicSessionController.php
│   │   │   ├── 🐘 Controller.php
│   │   │   ├── 🐘 DashboardController.php
│   │   │   ├── 🐘 DocumentController.php
│   │   │   ├── 🐘 NotificationController.php
│   │   │   ├── 🐘 RequestController.php
│   │   │   ├── 🐘 ResourceController.php
│   │   │   └── 🐘 UserAssignmentController.php
│   │   ├── 📁 Middleware
│   │   │   ├── 🐘 EnsureActiveSemester.php
│   │   │   ├── 🐘 EnsureAssignmentAccess.php
│   │   │   ├── 🐘 EnsureHasRole.php
│   │   │   ├── 🐘 EnsureUserType.php
│   │   │   ├── 🐘 HandleAppearance.php
│   │   │   └── 🐘 HandleInertiaRequests.php
│   │   └── 📁 Requests
│   │       ├── 📁 Academic
│   │       │   ├── 🐘 CloseSemesterRequest.php
│   │       │   ├── 🐘 FacultyRequest.php
│   │       │   ├── 🐘 SchoolRequest.php
│   │       │   ├── 🐘 StoreFacultyRequest.php
│   │       │   ├── 🐘 StoreSectionRequest.php
│   │       │   ├── 🐘 UpdateSchoolRequest.php
│   │       │   ├── 🐘 UpdateSectionRequest.php
│   │       │   └── 🐘 UpdateSemesterRequest.php
│   │       ├── 📁 Assignment
│   │       │   └── 🐘 StoreAssignmentManageRequest.php
│   │       ├── 📁 Document
│   │       │   ├── 🐘 UpdateDocumentStatusRequest.php
│   │       │   └── 🐘 UploadDocumentRequest.php
│   │       ├── 📁 Dossier
│   │       │   └── 🐘 UploadDocumentDossierRequest.php
│   │       ├── 📁 Group
│   │       │   ├── 🐘 AttachStudentsRequest.php
│   │       │   ├── 🐘 DetachStudentsRequest.php
│   │       │   ├── 🐘 MoveStudentsRequest.php
│   │       │   ├── 🐘 StoreGroupRequest.php
│   │       │   └── 🐘 UpdateGroupRequest.php
│   │       ├── 📁 Internship
│   │       │   ├── 🐘 SaveInternshipSettingRequest.php
│   │       │   ├── 🐘 StoreGradeInternshipRequest.php
│   │       │   ├── 🐘 StoreInternshipRequest.php
│   │       │   ├── 🐘 StorePlacementRequest.php
│   │       │   ├── 🐘 StoreRequestGradeChangeInternshipRequest.php
│   │       │   ├── 🐘 StoreRequestTypeChangeInternshipRequest.php
│   │       │   └── 🐘 UploadDocumentInternshipRequest.php
│   │       ├── 📁 Registration
│   │       │   ├── 🐘 StepOneRequest.php
│   │       │   ├── 🐘 StepThreeRequest.php
│   │       │   ├── 🐘 StepTwoRequest.php
│   │       │   ├── 🐘 StoreCompanyRequest.php
│   │       │   └── 🐘 StorePersonMassiveRequest.php
│   │       ├── 📁 Request
│   │       │   └── 🐘 UpdateManagementRequestStatusRequest.php
│   │       ├── 📁 Settings
│   │       │   ├── 🐘 PasswordUpdateRequest.php
│   │       │   ├── 🐘 ProfileDeleteRequest.php
│   │       │   ├── 🐘 ProfileDetailsUpdateRequest.php
│   │       │   ├── 🐘 ProfileMediaUpdateRequest.php
│   │       │   ├── 🐘 ProfileUpdateRequest.php
│   │       │   └── 🐘 TwoFactorAuthenticationRequest.php
│   │       ├── 📁 Supervision
│   │       │   ├── 🐘 StoreEvaluationRequest.php
│   │       │   └── 🐘 UpdateEvaluationStatusRequest.php
│   │       └── 🐘 ResourceRequest.php
│   ├── 📁 Models
│   │   ├── 🐘 Area.php
│   │   ├── 🐘 Assignment.php
│   │   ├── 🐘 Boss.php
│   │   ├── 🐘 Company.php
│   │   ├── 🐘 Document.php
│   │   ├── 🐘 DocumentType.php
│   │   ├── 🐘 Dossier.php
│   │   ├── 🐘 Evaluation.php
│   │   ├── 🐘 Faculty.php
│   │   ├── 🐘 Internship.php
│   │   ├── 🐘 InternshipGroup.php
│   │   ├── 🐘 InternshipSetting.php
│   │   ├── 🐘 Module.php
│   │   ├── 🐘 Notification.php
│   │   ├── 🐘 NotificationRecipient.php
│   │   ├── 🐘 Person.php
│   │   ├── 🐘 Placement.php
│   │   ├── 🐘 Position.php
│   │   ├── 🐘 Resource.php
│   │   ├── 🐘 Role.php
│   │   ├── 🐘 School.php
│   │   ├── 🐘 Section.php
│   │   ├── 🐘 Semester.php
│   │   ├── 🐘 Staff.php
│   │   ├── 🐘 StudentGroup.php
│   │   ├── 🐘 Supervision.php
│   │   ├── 🐘 TypeUser.php
│   │   ├── 🐘 User.php
│   │   └── 🐘 UserRequest.php
│   ├── 📁 Providers
│   │   ├── 🐘 AppServiceProvider.php
│   │   └── 🐘 FortifyServiceProvider.php
│   └── 📁 Services
│       ├── 📁 Academic
│       │   ├── 🐘 DossierService.php
│       │   ├── 🐘 FacultyService.php
│       │   ├── 🐘 InternshipGroupService.php
│       │   ├── 🐘 InternshipService.php
│       │   ├── 🐘 InternshipSettingService.php
│       │   ├── 🐘 PlacementService.php
│       │   ├── 🐘 SchoolService.php
│       │   ├── 🐘 SectionService.php
│       │   ├── 🐘 SemesterService.php
│       │   └── 🐘 SupervisionService.php
│       ├── 📁 Auth
│       │   ├── 🐘 SharedDataService.php
│       │   └── 🐘 SyncAcademicSessionService.php
│       ├── 📁 Company
│       │   └── 🐘 CompanyService.php
│       ├── 📁 Registration
│       │   └── 🐘 UserRegistrationService.php
│       ├── 📁 Settings
│       │   ├── 🐘 ProfileDetailsService.php
│       │   └── 🐘 ProfileMediaService.php
│       ├── 🐘 AssignmentService.php
│       ├── 🐘 DocumentService.php
│       ├── 🐘 NotificationService.php
│       ├── 🐘 RequestService.php
│       ├── 🐘 ResourceService.php
│       └── 🐘 UserAssignmentService.php
├── 📁 bootstrap
│   ├── 🐘 app.php
│   └── 🐘 providers.php
├── 📁 config
│   ├── 🐘 app.php
│   ├── 🐘 auth.php
│   ├── 🐘 cache.php
│   ├── 🐘 database.php
│   ├── 🐘 filesystems.php
│   ├── 🐘 fortify.php
│   ├── 🐘 inertia.php
│   ├── 🐘 logging.php
│   ├── 🐘 mail.php
│   ├── 🐘 queue.php
│   ├── 🐘 sanctum.php
│   ├── 🐘 services.php
│   └── 🐘 session.php
├── 📁 database
│   ├── 📁 factories
│   │   ├── 🐘 PersonFactory.php
│   │   └── 🐘 UserFactory.php
│   ├── 📁 migrations
│   │   ├── 🐘 2026_02_19_164034_create_cache_table.php
│   │   ├── 🐘 2026_02_19_164133_create_jobs_table.php
│   │   ├── 🐘 2026_02_19_164500_create_personal_access_tokens_table.php
│   │   ├── 🐘 2026_02_19_202605_create_roles_table.php
│   │   ├── 🐘 2026_02_19_202608_create_semesters_table.php
│   │   ├── 🐘 2026_02_19_202614_create_modules_table.php
│   │   ├── 🐘 2026_02_19_202622_create_faculties_table.php
│   │   ├── 🐘 2026_02_19_202625_create_schools_table.php
│   │   ├── 🐘 2026_02_19_202631_create_sections_table.php
│   │   ├── 🐘 2026_02_19_202706_create_people_table.php
│   │   ├── 🐘 2026_02_19_202718_create_users_table.php
│   │   ├── 🐘 2026_02_19_202802_add_two_factor_columns_users_table.php
│   │   ├── 🐘 2026_02_19_204435_create_assignments_table.php
│   │   ├── 🐘 2026_02_20_063150_create_dossiers_table.php
│   │   ├── 🐘 2026_02_21_044128_create_document_types_table.php
│   │   ├── 🐘 2026_02_21_044320_create_document_type_roles_table.php
│   │   ├── 🐘 2026_02_21_044801_create_documents_table.php
│   │   ├── 🐘 2026_02_21_194438_create_internship_groups_table.php
│   │   ├── 🐘 2026_02_21_194911_create_student_groups_table.php
│   │   ├── 🐘 2026_02_22_040106_create_supervisions_table.php
│   │   ├── 🐘 2026_02_22_040134_create_evaluations_table.php
│   │   ├── 🐘 2026_03_01_060944_create_companies_table.php
│   │   ├── 🐘 2026_03_01_061012_create_bosses_table.php
│   │   ├── 🐘 2026_03_03_180328_create_user_requests_table.php
│   │   ├── 🐘 2026_03_04_063125_create_resources_table.php
│   │   ├── 🐘 2026_03_04_151634_create_type_users_table.php
│   │   ├── 🐘 2026_03_11_225845_add_type_user_to_users_table.php
│   │   ├── 🐘 2026_03_28_040221_make_role_id_nullable_in_resources_table.php
│   │   ├── 🐘 2026_03_29_042432_create_positions_table.php
│   │   ├── 🐘 2026_03_29_042545_create_staffs_table.php.php
│   │   ├── 🐘 2026_03_29_042604_create_areas_table.php.php
│   │   ├── 🐘 2026_03_29_042617_create_vacancies_table.php
│   │   ├── 🐘 2026_03_29_042636_create_vacancy_schools_table.php
│   │   ├── 🐘 2026_03_29_042753_create_applications_table.php
│   │   ├── 🐘 2026_03_29_042805_create_placements_table.php
│   │   ├── 🐘 2026_03_29_054104_create_internships_table.php
│   │   ├── 🐘 2026_04_01_232948_create_internship_settings_table.php
│   │   ├── 🐘 2026_04_10_003809_create_notifications_table.php
│   │   └── 🐘 2026_04_10_004201_create_notification_recipients_table.php
│   ├── 📁 seeders
│   │   ├── 🐘 Cycle2026Seeder.php
│   │   ├── 🐘 DatabaseSeeder.php
│   │   ├── 🐘 DocumentTypeRoleSeeder.php
│   │   ├── 🐘 RoleSeeder.php
│   │   └── 🐘 TypeUserSeeder.php
│   └── ⚙️ .gitignore
├── 📁 docker
│   ├── ⚙️ .dockerignore
│   ├── 🐳 Dockerfile
│   └── 📄 entrypoint.sh
├── 📁 public
│   ├── ⚙️ .htaccess
│   ├── 🖼️ apple-touch-icon.png
│   ├── 📄 favicon.ico
│   ├── 🖼️ favicon.svg
│   ├── 🐘 index.php
│   ├── 🖼️ ins-unjfsc.png
│   └── 📄 robots.txt
├── 📁 resources
│   ├── 📁 css
│   │   └── 🎨 app.css
│   ├── 📁 js
│   │   ├── 📁 components
│   │   │   ├── 📁 academic
│   │   │   │   ├── 📄 academic-filter.tsx
│   │   │   │   ├── 📄 academic-pagination.tsx
│   │   │   │   ├── 📄 academic-search.tsx
│   │   │   │   ├── 📄 detail-header.tsx
│   │   │   │   ├── 📄 group-selector.tsx
│   │   │   │   ├── 📄 module-selector.tsx
│   │   │   │   ├── 📄 requirements-list.tsx
│   │   │   │   ├── 📄 status-form.tsx
│   │   │   │   ├── 📄 submission-form.tsx
│   │   │   │   ├── 📄 submission-panel.tsx
│   │   │   │   ├── 📄 validation-form.tsx
│   │   │   │   └── 📄 validation-panel.tsx
│   │   │   ├── 📁 document
│   │   │   │   ├── 📄 AlertHelp.tsx
│   │   │   │   ├── 📄 DocumentViewer.tsx
│   │   │   │   ├── 📄 FileHistory.tsx
│   │   │   │   ├── 📄 FilePreview.tsx
│   │   │   │   ├── 📄 UploadZone.tsx
│   │   │   │   └── 📄 detail-validation-form.tsx
│   │   │   ├── 📁 general
│   │   │   │   └── 📄 stepper.tsx
│   │   │   ├── 📁 ui
│   │   │   │   ├── 📄 accordion.tsx
│   │   │   │   ├── 📄 alert-dialog.tsx
│   │   │   │   ├── 📄 alert.tsx
│   │   │   │   ├── 📄 avatar.tsx
│   │   │   │   ├── 📄 badge.tsx
│   │   │   │   ├── 📄 breadcrumb.tsx
│   │   │   │   ├── 📄 button.tsx
│   │   │   │   ├── 📄 card.tsx
│   │   │   │   ├── 📄 checkbox.tsx
│   │   │   │   ├── 📄 collapsible.tsx
│   │   │   │   ├── 📄 combobox.tsx
│   │   │   │   ├── 📄 dialog.tsx
│   │   │   │   ├── 📄 dropdown-menu.tsx
│   │   │   │   ├── 📄 form.tsx
│   │   │   │   ├── 📄 icon.tsx
│   │   │   │   ├── 📄 input-group.tsx
│   │   │   │   ├── 📄 input-otp.tsx
│   │   │   │   ├── 📄 input.tsx
│   │   │   │   ├── 📄 label.tsx
│   │   │   │   ├── 📄 navigation-menu.tsx
│   │   │   │   ├── 📄 pagination.tsx
│   │   │   │   ├── 📄 placeholder-pattern.tsx
│   │   │   │   ├── 📄 radio-group.tsx
│   │   │   │   ├── 📄 scroll-area.tsx
│   │   │   │   ├── 📄 section-card.tsx
│   │   │   │   ├── 📄 select.tsx
│   │   │   │   ├── 📄 separator.tsx
│   │   │   │   ├── 📄 sheet.tsx
│   │   │   │   ├── 📄 sidebar.tsx
│   │   │   │   ├── 📄 skeleton.tsx
│   │   │   │   ├── 📄 spinner.tsx
│   │   │   │   ├── 📄 switch.tsx
│   │   │   │   ├── 📄 table.tsx
│   │   │   │   ├── 📄 tabs.tsx
│   │   │   │   ├── 📄 textarea.tsx
│   │   │   │   ├── 📄 toggle-group.tsx
│   │   │   │   ├── 📄 toggle.tsx
│   │   │   │   └── 📄 tooltip.tsx
│   │   │   ├── 📄 alert-error.tsx
│   │   │   ├── 📄 app-content.tsx
│   │   │   ├── 📄 app-header.tsx
│   │   │   ├── 📄 app-logo-icon.tsx
│   │   │   ├── 📄 app-logo.tsx
│   │   │   ├── 📄 app-shell.tsx
│   │   │   ├── 📄 app-sidebar-header.tsx
│   │   │   ├── 📄 app-sidebar.tsx
│   │   │   ├── 📄 appearance-tabs.tsx
│   │   │   ├── 📄 assignment-access-notice.tsx
│   │   │   ├── 📄 breadcrumbs.tsx
│   │   │   ├── 📄 delete-user.tsx
│   │   │   ├── 📄 exception-handler.tsx
│   │   │   ├── 📄 heading.tsx
│   │   │   ├── 📄 historic-notice.tsx
│   │   │   ├── 📄 input-error.tsx
│   │   │   ├── 📄 nav-footer.tsx
│   │   │   ├── 📄 nav-main.tsx
│   │   │   ├── 📄 nav-user.tsx
│   │   │   ├── 📄 notification-dropdown.tsx
│   │   │   ├── 📄 text-link.tsx
│   │   │   ├── 📄 two-factor-recovery-codes.tsx
│   │   │   ├── 📄 two-factor-setup-modal.tsx
│   │   │   ├── 📄 user-info.tsx
│   │   │   └── 📄 user-menu-content.tsx
│   │   ├── 📁 config
│   │   │   ├── 📄 navigation.tsx
│   │   │   └── 📄 notification.tsx
│   │   ├── 📁 hooks
│   │   │   ├── 📄 use-academic-table.tsx
│   │   │   ├── 📄 use-appearance.tsx
│   │   │   ├── 📄 use-clipboard.ts
│   │   │   ├── 📄 use-config-table.tsx
│   │   │   ├── 📄 use-current-url.ts
│   │   │   ├── 📄 use-initials.tsx
│   │   │   ├── 📄 use-item-detail.tsx
│   │   │   ├── 📄 use-mobile-navigation.ts
│   │   │   ├── 📄 use-mobile.tsx
│   │   │   └── 📄 use-two-factor-auth.ts
│   │   ├── 📁 layouts
│   │   │   ├── 📁 academic
│   │   │   │   └── 📄 settings-layout.tsx
│   │   │   ├── 📁 app
│   │   │   │   ├── 📄 app-header-layout.tsx
│   │   │   │   └── 📄 app-sidebar-layout.tsx
│   │   │   ├── 📁 auth
│   │   │   │   ├── 📄 auth-card-layout.tsx
│   │   │   │   ├── 📄 auth-simple-layout.tsx
│   │   │   │   └── 📄 auth-split-layout.tsx
│   │   │   ├── 📁 settings
│   │   │   │   └── 📄 layout.tsx
│   │   │   ├── 📄 app-layout.tsx
│   │   │   └── 📄 auth-layout.tsx
│   │   ├── 📁 lib
│   │   │   └── 📄 utils.ts
│   │   ├── 📁 pages
│   │   │   ├── 📁 academic
│   │   │   │   ├── 📁 dashboard
│   │   │   │   │   ├── 📄 admin-content.tsx
│   │   │   │   │   ├── 📄 student-content.tsx
│   │   │   │   │   ├── 📄 supervisor-content.tsx
│   │   │   │   │   └── 📄 teacher-content.tsx
│   │   │   │   ├── 📁 dossier
│   │   │   │   │   ├── 📁 components
│   │   │   │   │   │   ├── 📄 dossier-detail-panel.tsx
│   │   │   │   │   │   └── 📄 dossier-table.tsx
│   │   │   │   │   ├── 📁 hooks
│   │   │   │   │   │   └── 📄 use-dossier-validation.ts
│   │   │   │   │   ├── 📁 submission
│   │   │   │   │   │   ├── 📄 FileDetailsContent.tsx
│   │   │   │   │   │   └── 📄 index.tsx
│   │   │   │   │   └── 📁 validation
│   │   │   │   │       └── 📄 index.tsx
│   │   │   │   ├── 📁 group
│   │   │   │   │   ├── 📁 components
│   │   │   │   │   │   └── 📄 student-selector-table.tsx
│   │   │   │   │   ├── 📁 hooks
│   │   │   │   │   │   ├── 📄 use-internship-group.ts
│   │   │   │   │   │   ├── 📄 use-student-group.ts
│   │   │   │   │   │   └── 📄 use-student-management.ts
│   │   │   │   │   ├── 📁 internship
│   │   │   │   │   │   ├── 📁 partials
│   │   │   │   │   │   │   ├── 📄 create-group-modal.tsx
│   │   │   │   │   │   │   ├── 📄 delete-group-modal.tsx
│   │   │   │   │   │   │   ├── 📄 edit-group-modal.tsx
│   │   │   │   │   │   │   ├── 📄 store.schema.ts
│   │   │   │   │   │   │   └── 📄 update.schema.ts
│   │   │   │   │   │   └── 📄 index.tsx
│   │   │   │   │   ├── 📁 student
│   │   │   │   │   │   ├── 📁 partials
│   │   │   │   │   │   │   └── 📄 student-management-tabs.tsx
│   │   │   │   │   │   └── 📄 index.tsx
│   │   │   │   │   └── 📁 supervision
│   │   │   │   │       ├── 📁 hooks
│   │   │   │   │       │   └── 📄 use-group-supervision.ts
│   │   │   │   │       └── 📄 index.tsx
│   │   │   │   ├── 📁 internship
│   │   │   │   │   ├── 📁 components
│   │   │   │   │   │   └── 📄 type-selector.tsx
│   │   │   │   │   ├── 📁 settings
│   │   │   │   │   │   ├── 📁 components
│   │   │   │   │   │   │   ├── 📄 BuilderCard.tsx
│   │   │   │   │   │   │   ├── 📄 EvaluationCard.tsx
│   │   │   │   │   │   │   ├── 📄 JsonPreview.tsx
│   │   │   │   │   │   │   ├── 📄 RequirementColumn.tsx
│   │   │   │   │   │   │   └── 📄 StepperPreview.tsx
│   │   │   │   │   │   ├── 📄 index.tsx
│   │   │   │   │   │   ├── 📄 types.ts
│   │   │   │   │   │   ├── 📄 useDragSort.ts
│   │   │   │   │   │   └── 📄 useWorkflow.ts
│   │   │   │   │   ├── 📁 submission
│   │   │   │   │   │   ├── 📁 components
│   │   │   │   │   │   │   ├── 📄 company-form.tsx
│   │   │   │   │   │   │   └── 📄 document-form.tsx
│   │   │   │   │   │   ├── 📁 hooks
│   │   │   │   │   │   │   ├── 📄 use-internship-submission.tsx
│   │   │   │   │   │   │   └── 📄 use-placement-submission.tsx
│   │   │   │   │   │   ├── 📁 parts
│   │   │   │   │   │   │   ├── 📄 DocumentViewerPanel.tsx
│   │   │   │   │   │   │   ├── 📄 EvaluationView.tsx
│   │   │   │   │   │   │   └── 📄 RequirementListPanel.tsx
│   │   │   │   │   │   ├── 📁 schemas
│   │   │   │   │   │   │   └── 📄 detail.schema.ts
│   │   │   │   │   │   ├── 📄 internshipIndex.tsx
│   │   │   │   │   │   └── 📄 placementIndex.tsx
│   │   │   │   │   └── 📁 validation
│   │   │   │   │       ├── 📁 hooks
│   │   │   │   │       │   └── 📄 use-validation.ts
│   │   │   │   │       ├── 📁 partials
│   │   │   │   │       │   ├── 📄 internship-detail.tsx
│   │   │   │   │       │   ├── 📄 pending-grade-change-modal.tsx
│   │   │   │   │       │   ├── 📄 placement-detail.tsx
│   │   │   │   │       │   └── 📄 request-grade-change-modal.tsx
│   │   │   │   │       └── 📄 index.tsx
│   │   │   │   ├── 📁 management
│   │   │   │   │   ├── 📁 faculty
│   │   │   │   │   │   ├── 📁 partials
│   │   │   │   │   │   │   ├── 📄 create-faculty-modal.tsx
│   │   │   │   │   │   │   ├── 📄 delete-faculty-modal.tsx
│   │   │   │   │   │   │   └── 📄 update-faculty-modal.tsx
│   │   │   │   │   │   └── 📄 index.tsx
│   │   │   │   │   ├── 📁 school
│   │   │   │   │   │   ├── 📁 partials
│   │   │   │   │   │   │   ├── 📄 create-school-modal.tsx
│   │   │   │   │   │   │   ├── 📄 delete-school-modal.tsx
│   │   │   │   │   │   │   └── 📄 update-school-modal.tsx
│   │   │   │   │   │   └── 📄 index.tsx
│   │   │   │   │   ├── 📁 section
│   │   │   │   │   │   ├── 📁 partials
│   │   │   │   │   │   │   └── 📄 manage-sections-modal.tsx
│   │   │   │   │   │   └── 📄 index.tsx
│   │   │   │   │   └── 📁 semesters
│   │   │   │   │       ├── 📁 partials
│   │   │   │   │       │   ├── 📄 back-semester-modal.tsx
│   │   │   │   │       │   ├── 📄 close-semester-modal.tsx
│   │   │   │   │       │   └── 📄 update-semester-modal.tsx
│   │   │   │   │       └── 📄 index.tsx
│   │   │   │   ├── 📁 resource
│   │   │   │   │   ├── 📁 partials
│   │   │   │   │   │   ├── 📄 create-resource-sheet.tsx
│   │   │   │   │   │   ├── 📄 delete-resource-alert.tsx
│   │   │   │   │   │   ├── 📄 edit-resource-sheet.tsx
│   │   │   │   │   │   └── 📄 location-selector.tsx
│   │   │   │   │   └── 📄 resource-content.tsx
│   │   │   │   ├── 📁 settings
│   │   │   │   │   ├── 📁 document
│   │   │   │   │   │   ├── 📁 components
│   │   │   │   │   │   │   ├── 📄 DocumentTypeForm.tsx
│   │   │   │   │   │   │   └── 📄 DocumentTypeTable.tsx
│   │   │   │   │   │   ├── 📁 hooks
│   │   │   │   │   │   │   └── 📄 use-document.ts
│   │   │   │   │   │   └── 📄 index.tsx
│   │   │   │   │   └── 📄 internship.tsx
│   │   │   │   ├── 📁 supervision
│   │   │   │   │   ├── 📁 components
│   │   │   │   │   │   ├── 📄 supervision-detail-panel.tsx
│   │   │   │   │   │   └── 📄 supervision-table.tsx
│   │   │   │   │   ├── 📁 hooks
│   │   │   │   │   │   └── 📄 use-supervision.ts
│   │   │   │   │   ├── 📁 student
│   │   │   │   │   │   └── 📄 index.tsx
│   │   │   │   │   ├── 📁 submission
│   │   │   │   │   │   ├── 📁 components
│   │   │   │   │   │   │   └── 📄 SubmitForm.tsx
│   │   │   │   │   │   └── 📄 index.tsx
│   │   │   │   │   └── 📁 validation
│   │   │   │   │       └── 📄 index.tsx
│   │   │   │   └── 📁 user
│   │   │   │       ├── 📁 management
│   │   │   │       │   ├── 📁 hooks
│   │   │   │       │   │   └── 📄 use-user-management.ts
│   │   │   │       │   ├── 📁 partials
│   │   │   │       │   │   ├── 📄 manage-assignment-modal.tsx
│   │   │   │       │   │   └── 📄 pending-request-modal.tsx
│   │   │   │       │   └── 📄 index.tsx
│   │   │   │       └── 📁 register
│   │   │   │           ├── 📁 components
│   │   │   │           │   ├── 📁 AcademicSelector
│   │   │   │           │   │   ├── 📄 AcademicSelector.tsx
│   │   │   │           │   │   ├── 📄 academic.schema.ts
│   │   │   │           │   │   └── 📄 useAcademicAutoResolver.ts
│   │   │   │           │   ├── 📄 RegistrationModeSelector.tsx
│   │   │   │           │   ├── 📄 SidebarInfo.tsx
│   │   │   │           │   ├── 📄 Stepper.tsx
│   │   │   │           │   ├── 📄 ToggleGroup.tsx
│   │   │   │           │   └── 📄 steps.config.ts
│   │   │   │           ├── 📁 person
│   │   │   │           │   ├── 📁 partials
│   │   │   │           │   │   ├── 📁 person
│   │   │   │           │   │   │   ├── 📁 step-one
│   │   │   │           │   │   │   │   ├── 📄 PersonVStepOne.tsx
│   │   │   │           │   │   │   │   └── 📄 schema.ts
│   │   │   │           │   │   │   ├── 📁 step-three
│   │   │   │           │   │   │   │   └── 📄 PersonSStepThree.tsx
│   │   │   │           │   │   │   └── 📁 step-two
│   │   │   │           │   │   │       ├── 📄 PersonFStepTwo.tsx
│   │   │   │           │   │   │       └── 📄 schema.ts
│   │   │   │           │   │   └── 📁 person-massive
│   │   │   │           │   │       ├── 📁 step-one
│   │   │   │           │   │       │   ├── 📁 components
│   │   │   │           │   │       │   │   ├── 📄 CsvPreview.tsx
│   │   │   │           │   │       │   │   └── 📄 CsvUploader.tsx
│   │   │   │           │   │       │   ├── 📄 MassiveVStepOne.tsx
│   │   │   │           │   │       │   ├── 📄 csv.schema.ts
│   │   │   │           │   │       │   ├── 📄 csv.utils.ts
│   │   │   │           │   │       │   └── 📄 schema.ts
│   │   │   │           │   │       ├── 📁 step-three
│   │   │   │           │   │       │   └── 📄 MassiveRStepThree.tsx
│   │   │   │           │   │       └── 📁 step-two
│   │   │   │           │   │           ├── 📁 partials
│   │   │   │           │   │           │   └── 📄 DataPreviewModal.tsx
│   │   │   │           │   │           └── 📄 MassiveSStepTwo.tsx
│   │   │   │           │   ├── 📄 PersonFlow.tsx
│   │   │   │           │   ├── 📄 person.service.ts
│   │   │   │           │   └── 📄 person.types.ts
│   │   │   │           └── 📄 index.tsx
│   │   │   ├── 📁 admin
│   │   │   │   ├── 📄 dashboard-content.tsx
│   │   │   │   └── 📄 resource-content.tsx
│   │   │   ├── 📁 auth
│   │   │   │   ├── 📄 confirm-password.tsx
│   │   │   │   ├── 📄 forgot-password.tsx
│   │   │   │   ├── 📄 login.tsx
│   │   │   │   ├── 📄 register.tsx
│   │   │   │   ├── 📄 reset-password.tsx
│   │   │   │   ├── 📄 two-factor-challenge.tsx
│   │   │   │   └── 📄 verify-email.tsx
│   │   │   ├── 📁 company
│   │   │   │   ├── 📄 dashboard-content.tsx
│   │   │   │   ├── 📄 register.tsx
│   │   │   │   └── 📄 resource-content.tsx
│   │   │   ├── 📁 settings
│   │   │   │   ├── 📁 partials
│   │   │   │   │   ├── 📄 profile-hero.tsx
│   │   │   │   │   ├── 📄 update-company-profile-form.tsx
│   │   │   │   │   └── 📄 update-person-profile-form.tsx
│   │   │   │   ├── 📄 about.tsx
│   │   │   │   ├── 📄 appearance.tsx
│   │   │   │   ├── 📄 password.tsx
│   │   │   │   ├── 📄 profile.tsx
│   │   │   │   └── 📄 two-factor.tsx
│   │   │   ├── 📄 dashboard.tsx
│   │   │   ├── 📄 landing.tsx
│   │   │   ├── 📄 notification.tsx
│   │   │   ├── 📄 resource.tsx
│   │   │   └── 📄 welcome.tsx
│   │   ├── 📁 types
│   │   │   ├── 📄 auth.ts
│   │   │   ├── 📄 data.tsx
│   │   │   ├── 📄 global.d.ts
│   │   │   ├── 📄 index.ts
│   │   │   ├── 📄 models.ts
│   │   │   ├── 📄 navigation.ts
│   │   │   ├── 📄 ui.ts
│   │   │   └── 📄 vite-env.d.ts
│   │   ├── 📄 app.tsx
│   │   └── 📄 ssr.tsx
│   └── 📁 views
│       └── 🐘 app.blade.php
├── 📁 routes
│   ├── 📁 academic
│   │   ├── 🐘 dossier.php
│   │   ├── 🐘 general.php
│   │   ├── 🐘 groups.php
│   │   ├── 🐘 internship.php
│   │   └── 🐘 supervision.php
│   ├── 📁 company
│   │   └── 🐘 general.php
│   ├── 🐘 api.php
│   ├── 🐘 console.php
│   ├── 🐘 request.php
│   ├── 🐘 resource.php
│   ├── 🐘 settings.php
│   ├── 🐘 user.php
│   └── 🐘 web.php
├── 📁 storage
│   ├── 📁 app
│   │   ├── 📁 private
│   │   │   └── ⚙️ .gitignore
│   │   ├── 📁 public
│   │   │   └── ⚙️ .gitignore
│   │   └── ⚙️ .gitignore
│   ├── 📁 framework
│   │   ├── 📁 sessions
│   │   │   └── ⚙️ .gitignore
│   │   ├── 📁 testing
│   │   │   └── ⚙️ .gitignore
│   │   ├── 📁 views
│   │   │   └── ⚙️ .gitignore
│   │   └── ⚙️ .gitignore
│   └── 📁 logs
│       └── ⚙️ .gitignore
├── 📁 tests
│   ├── 📁 Feature
│   │   ├── 📁 Auth
│   │   │   ├── 🐘 AuthenticationTest.php
│   │   │   ├── 🐘 EmailVerificationTest.php
│   │   │   ├── 🐘 PasswordConfirmationTest.php
│   │   │   ├── 🐘 PasswordResetTest.php
│   │   │   ├── 🐘 RegistrationTest.php
│   │   │   ├── 🐘 TwoFactorChallengeTest.php
│   │   │   └── 🐘 VerificationNotificationTest.php
│   │   ├── 📁 Settings
│   │   │   ├── 🐘 PasswordUpdateTest.php
│   │   │   ├── 🐘 ProfileUpdateTest.php
│   │   │   └── 🐘 TwoFactorAuthenticationTest.php
│   │   ├── 🐘 DashboardTest.php
│   │   └── 🐘 ExampleTest.php
│   ├── 📁 Unit
│   │   └── 🐘 ExampleTest.php
│   ├── 🐘 Pest.php
│   └── 🐘 TestCase.php
├── ⚙️ .dockerignore
├── ⚙️ .editorconfig
├── ⚙️ .env.example
├── ⚙️ .gitattributes
├── ⚙️ .gitignore
├── ⚙️ .npmrc
├── ⚙️ .prettierignore
├── ⚙️ .prettierrc
├── 📄 LICENSE
├── 📝 README.md
├── 📄 artisan
├── ⚙️ components.json
├── ⚙️ composer.json
├── ⚙️ docker-compose.prod.yml
├── ⚙️ docker-compose.yml
├── 📄 eslint.config.js
├── 📄 node
├── 📄 npm
├── ⚙️ package-lock.json
├── ⚙️ package.json
├── ⚙️ phpunit.xml
├── ⚙️ pint.json
├── ⚙️ tsconfig.json
└── 📄 vite.config.ts
```

---
*Generated by FileTree Pro Extension*