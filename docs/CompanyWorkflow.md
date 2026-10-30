# Integración de empresas y Pasantía

Actualización: 24 de octubre de 2026. El frontend utiliza las APIs descritas en [CompanyValidationBackend.md](CompanyValidationBackend.md).

## Ubicación y responsabilidades

- **Estudiante → Pasantía (`/internship`)**: consulta RUC, solicitud de empresa nueva o confirmación de empresa existente, declaración, ficha RUC opcional, estado e historial, correcciones, reenvío de correo y registro de jefe inmediato/práctica después de la aceptación.
- **Titular → Empresas (`/empresas`)**: solicitudes de su escuela y semestre, filtros y paginación, detalle, descarga privada de ficha y aprobación/observación/rechazo.
- **Invitación → `/empresa/activar?token=…`**: consulta la invitación, muestra empresa/alumno/términos, recibe representante, celular y contraseña, y activa la cuenta. La empresa no acepta al estudiante al activar su cuenta.
- **Empresa → Solicitudes de estudiantes (`/empresa/solicitudes`)**: listado, detalle y aceptación/rechazo del estudiante. El correo y las notificaciones abren esta pantalla.
- **Estudiante → Rev. informe (`/internship/report-review`)**: conserva el módulo de plan e informe desarrollado por el equipo; las cargas requieren aceptación empresarial y datos de práctica registrados. El supervisor mantiene la evaluación existente.

El menú independiente «Registrar empresa» se retiró. Su URL anterior redirige a Pasantía. Las antiguas URLs de vista previa local redirigen a las pantallas autenticadas; no hay estados de demostración que habiliten acciones.

## Conexión con el backend

`resources/js/modules/company/services/company-workflow.ts` concentra los 13 endpoints: consulta de RUC, solicitud actual, envío/corrección, listado/detalle, revisión, reenvío, decisión empresarial, práctica y consulta/activación de invitación. La ficha privada se descarga mediante la URL autorizada que devuelve el recurso.

Las peticiones JSON usan sesión, cookies del mismo origen y CSRF de Laravel. Los errores 422 muestran los mensajes de validación; los estados 401/403/409/410/419/429 se presentan sin simular éxito. Después de activar se realiza una navegación completa para cargar la nueva sesión empresarial. Las pantallas permiten actualizar el estado de manera explícita.

La consulta utiliza `/api/company-validation/companies/{ruc}`. La API antigua de consulta permanece disponible por compatibilidad; ya no dirige la solicitud nueva ni confunde un mensaje informativo con un error.

## Flujo para probar

1. Ingresar como estudiante aprobado, con escuela y semestre activos. Abrir Pasantía, verificar un RUC nuevo, completar datos y declaración y enviar solicitud. No debe crearse la empresa ni enviarse invitación antes de la aprobación.
2. Ingresar como titular de la misma escuela y semestre. En Empresas, abrir la solicitud. Observar o rechazar requiere comentario; el estudiante puede corregir y reenviar. Aprobar crea la empresa y encola la invitación.
3. Abrir el enlace recibido como visitante. Completar representante, celular, contraseña y términos. Un token inválido, vencido o utilizado debe mostrar el error del servidor.
4. Como empresa, abrir Solicitudes de estudiantes y aceptar al alumno. Rechazar requiere motivo y permite que el alumno presente otra propuesta corregida.
5. Como estudiante, actualizar el estado en Pasantía. Solo después de la aceptación, guardar jefe inmediato, área, cargo, funciones, fechas y declaración de práctica.
6. Comprobar que se habilitan los documentos de formalización y la carga de plan/informe en su módulo. Antes de estos requisitos, tanto el frontend como el servidor deben impedir la carga, incluso por petición directa.
7. Repetir con un RUC existente: sus datos se cargan del catálogo y se envía la confirmación directamente a la empresa, sin una segunda revisión del titular.

## Preparación del entorno

No se agrega una migración nueva en esta integración. Deben estar aplicadas las migraciones existentes de validación de empresas y de `practice_submissions`.

Para el módulo de plan/informe, si aún faltan sus tipos documentales:

```sh
php artisan db:seed --class=PracticeDocumentTypeSeeder
```

Este seeder existente agrega los tipos por código sin borrar los demás. Si se utiliza `DocumentTypeRoleSeeder`, ejecutar `PracticeDocumentTypeSeeder` después porque el primero reinicia el pivote de permisos.

Configurar SMTP y remitente institucional para enviar correo real. `MAIL_MAILER=log` solo escribe el mensaje en el log. Con cola en base de datos, mantener `php artisan queue:work --tries=3`. Las pruebas automáticas simulan correo y almacenamiento; no prueban la entrega SMTP real.

El seeder de desarrollo vincula explícitamente la empresa demo con su usuario para poder usar las mismas comprobaciones de propiedad de las cuentas activadas. No se adjudican empresas reales automáticamente por coincidencia de correo.

## Validación de esta integración

- Suite completa: 122 pruebas aprobadas, 1.067 aserciones.
- Empresas: 33 pruebas aprobadas, incluyendo navegación por rol y bloqueo/habilitación del plan e informe.
- TypeScript, ESLint del repositorio, Prettier de `resources/`, Laravel Pint y compilación Vite: correctos.
- Navegador sobre SQLite temporal con usuarios sintéticos: solicitud nueva desde Pasantía, revisión/aprobación del titular, lectura de la invitación, aceptación empresarial, guardado/persistencia del jefe y la práctica, habilitación documental y acceso al módulo de planes/informes. También se comprobó el RUC existente y su confirmación directa, sin revisión del titular.
- La activación y los tokens se comprueban además en las pruebas HTTP; no se verificó la entrega de correo mediante SMTP real.
- La comprobación en navegador no modificó la base de desarrollo ni envió mensajes a terceros.
