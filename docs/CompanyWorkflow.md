# Flujo de incorporación y gestión de empresas

## Pantallas y vista previa local

- `/estudiante/registro-empresa`: pantalla independiente para consultar el RUC,
  revisar datos de una empresa existente o completar una solicitud nueva, y
  consultar visualmente el estado.
- `/empresas`: listado académico de empresas registradas y espacio para revisar
  solicitudes de incorporación.
- `/empresa/activar`: vista de activación empresarial. No activa cuentas sin el
  contrato del token definido por el backend.
- `/dev/vista-previa/registro-empresa` y `/dev/vista-previa/empresas`: accesos
  locales sin autenticación para revisar las pantallas de estudiante y docente.
  Las rutas responden únicamente en `APP_ENV=local`.
- El panel empresarial incluye una opción **Vista previa** solo en desarrollo.
  Los datos de esa vista son ilustrativos, no se guardan y no simulan respuestas
  exitosas del servidor.

Para revisar las pantallas sin depender de los endpoints pendientes, inicia
Laravel y Vite como de costumbre, ingresa con una cuenta de estudiante para
`/estudiante/registro-empresa` o con una cuenta docente titular para `/empresas`,
y selecciona **Vista previa**. La consulta real del RUC permanece conectada al
endpoint existente y consulta únicamente la tabla local `companies`.
Para inspeccionar las pantallas sin iniciar sesión ni llamar a las API de negocio,
abre directamente `http://localhost:8000/dev/vista-previa/registro-empresa` o
`http://localhost:8000/dev/vista-previa/empresas`. Estas rutas requieren que
Laravel esté ejecutándose, pero solo están disponibles en entorno local.

## Contratos existentes verificados

| Operación | Contrato disponible | Límite para el flujo de incorporación |
|---|---|---|
| Consultar RUC | `GET /api/internship/companies/verify/{ruc}` | Busca una empresa existente localmente; no consulta SUNAT. Retorna `found`, `company` y `areas`. |
| Registrar formalización | `POST /internship/placements` | Crea una formalización de prácticas; no crea una solicitud de incorporación empresarial independiente. |
| Revisar formalización | `PATCH /internship/placements/{placement}/status` | Solo permite aprobación (`approval_status=1`) u observación (`approval_status=3`). No aprueba/rechaza solicitudes de empresa. |
| Crear cuenta empresarial existente | `POST /register/company` | Requiere usuario académico verificado con rol 1, 2 o 3; crea empresa y usuario directamente con contraseña temporal fija. No se usa para la solicitud del estudiante ni como invitación. |
| Subir documentos de formalización | `POST /internship/placements/{placement}/documents` | Recibe `code` (`fut`, `carta_presentacion`, `carta_aceptacion`) y PDF de hasta 2 MB. No cubre ficha RUC, plan ni informe. |

## Contratos que debe completar el backend

El repositorio no contiene contratos verificables para las operaciones siguientes.
Las pantallas muestran explícitamente estos pendientes y no envían peticiones a
URLs supuestas:

- Crear, listar, consultar, observar, reenviar o rechazar una solicitud de
  incorporación de empresa, incluyendo observación, estudiante solicitante,
  documento RUC y estado independiente de la formalización.
- Enviar confirmación a una empresa existente y notificar al docente titular.
- Aprobar una solicitud de incorporación y activar el correo de invitación.
- Validar token de activación, expiración y uso previo; recibir los campos
  definitivos para activar la cuenta y establecer contraseña.
- Listar métricas y solicitudes para el panel empresarial; aceptar a un
  estudiante y actualizar su estado.
- Guardar los datos de jefe inmediato y práctica después de la aceptación.
- Listar, cargar, consultar y descargar FUT, carta de presentación, carta de
  aceptación, plan e informe, con reglas de acceso y estado.

Antes de conectar esos controles, el backend debe definir método, ruta, permiso,
payload, respuesta, códigos de error y reglas de idempotencia. La invitación no
debe duplicar un mecanismo existente: en el estado actual del repositorio no se
encontró uno.

## Acceso empresarial de demostración

El seeder `Cycle2026Seeder` crea `empresa.demo@unjfsc.edu.pe` con contraseña
temporal `12345678` y un vínculo de personal empresarial. No se requiere correo
para iniciar sesión con esa cuenta local. La contraseña solo corresponde a los
datos de desarrollo del seeder; no debe usarse como credencial de producción.
