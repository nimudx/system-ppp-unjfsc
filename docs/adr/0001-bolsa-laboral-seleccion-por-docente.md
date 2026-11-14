# ADR 0001: Bolsa laboral con selección por docente titular

- **Fecha:** 2026-11-09
- **Estado:** aceptado
- **Contexto:** módulo JobBoard (`app/Domains/JobBoard`, `resources/js/modules/jobboard`)

## Contexto

El diseño heredado de la bolsa laboral permitía que un estudiante se postulara
directamente a una vacante (`applications`) y que la empresa viera esos datos.
Ese flujo no encaja con el objetivo del sistema: aumentar la empleabilidad sin
exponer datos personales de estudiantes fuera de la universidad y manteniendo
el contacto final bajo control institucional.

Además, el repo ya cuenta con empresas que se aprueban mediante el flujo de
validación de `Company` (docente titular + aceptación de la empresa), por lo
que no corresponde crear una segunda aprobación de empresas para publicar
vacantes.

## Decisión

1. **Se reemplaza la postulación directa del estudiante** por una propuesta del
   **docente titular** de la sección, con una nota y trazabilidad de quién
   propuso a cada estudiante (`vacancy_candidates`).
2. La **empresa** crea vacantes y elige escuelas destino. Solo puede operar si
   `CompanyWorkflowAccess::company()` devuelve una empresa activa; no se añade
   un estado de aprobación nuevo en `companies`.
3. El **administrador** (rol 1) o el **subadministrador** (rol 2, limitado a su
   facultad) revisa cada vacante enviada y decide aprobar, observar o rechazar.
   Al aprobar **confirma las escuelas destino** (puede ajustarlas respecto a las
   propuestas por la empresa, siempre dentro de su facultad si es subadmin) y
   puede avisar a los docentes titulares de esas escuelas.
4. El **docente titular** (rol 3) ve únicamente vacantes publicadas para su
   escuela y propone estudiantes de **su sección y semestre**, activos, con rol
   estudiante y expediente aprobado. Puede retirar su propuesta mientras siga
   en estado `proposed`.
5. El **administrador** gestiona manualmente el estado de cada candidato
   (`contacted`, `hired`, `discarded`) y cierra la vacante. El contacto con la
   empresa y el envío del CV ocurren **fuera del sistema**.
6. La **empresa no recibe datos de estudiantes**. El detalle que ve el titular
   tampoco incluye los datos de contacto de la empresa.
7. **No hay listado público en v1.** `/bolsa` se conserva como pantalla de
   demostración existente y no forma parte del flujo interno. Las rutas
   internas viven en `empresa/bolsa`, `bolsa/administracion` y `bolsa/vacantes`.
8. Las notificaciones son **solo dentro del sistema**. Los enlaces usan rutas
   `academic.jobboard.*` con `?v={id}`; la empresa resuelve su enlace con el
   patrón de `company-validation` en `resolve-url.ts`.

## Consecuencias

### Positivas

- Los datos personales de estudiantes no salen de la universidad.
- El proceso queda auditado: vacante, revisión, propuesta y estado del
  candidato tienen actor, fecha y comentario.
- Se reutilizan los middlewares, policies, notificaciones y el flujo de
  empresas ya existentes.
- Las reglas de transición viven en los servicios, no en los controladores.

### Costos y riesgos

- La tabla heredada `applications` deja de usarse en el flujo nuevo. No se
  elimina para no romper datos históricos; `ApplicationFactory` permanece
  vacío porque no existe un modelo `Application` en el dominio actual.
- La búsqueda del CV depende de que el dossier tenga un `DocumentType` con
  código `cv`; si falta, la UI muestra "Sin CV" y el administrador debe
  conseguirlo por otra vía.
- El CV se sirve con URL firmada desde el disco `public`; conviene revisar la
  política de retención y el acceso a esos archivos.
- El aviso a docentes se calcula por escuela y semestre de la vacante; si una
  escuela no tiene titular activo, no habrá destinatarios y el admin debe
  contactar por otra vía.
- La etiqueta "Nuevo" del menú usa `localStorage` como comodidad por navegador;
  no sustituye al control de vistas por usuario (`vacancy_views`).

## Alternativas descartadas

- Mantener la postulación directa del estudiante y ocultar los datos en la
  vista: no resuelve el requisito de que la universidad filtre candidatos.
- Crear una aprobación adicional de empresas: duplica el flujo ya existente y
  añade un estado innecesario.
- Añadir correo o colas en v1: el alcance pide notificaciones solo dentro del
  sistema y sin dependencias nuevas.

## Referencias

- Especificación: `docs/BolsaLaboral.md`.
- Tablas: `docs/Database.md`.
- Rutas: `app/Domains/JobBoard/routes/web.php`.
