# Reorganización del backend por dominios

Se trasladó el código existente al esquema solicitado, manteniendo las URLs, los nombres de rutas y sus middleware. El frontend permanece en `resources/js/modules` y `resources/js/shared`.

## Organización aplicada

- `app/Shared`: concerns, enums transversales, excepciones base, middleware, controladores globales y registro de rutas.
- `app/Domains/Identity`: usuarios, personas, asignaciones, perfil, sesión académica y Fortify.
- `app/Domains/Registration`: registro individual y masivo.
- `app/Domains/Academic`: facultades, escuelas, secciones y semestres.
- `app/Domains/Documents`: documentos, tipos y configuración documental.
- `app/Domains/Dossier`: expedientes.
- `app/Domains/Internship`: formalización, seguimiento y configuración de prácticas.
- `app/Domains/Supervision`: grupos, estudiantes por grupo, supervisión y evaluaciones.
- `app/Domains/Requests`: solicitudes de gestión.
- `app/Domains/Resources`: recursos académicos.
- `app/Domains/Notifications`: notificaciones y destinatarios.
- `app/Domains/Company`: empresas, áreas, jefes, cargos y personal.
- `app/Domains/JobBoard`: conserva únicamente la ruta existente de la pantalla de bolsa. Las carpetas propuestas para funcionalidades nuevas contienen solo `.gitkeep`.
- `app/Console/Commands` y las carpetas nuevas de contracts, policies y listeners quedan reservadas con `.gitkeep`.

Las clases se trasladaron con sus nombres originales. Se conservaron los requests existentes. Posteriormente se corrigieron los fallos encontrados y el control de calidad completo, por autorización del usuario; las funcionalidades futuras siguen reservadas como carpetas vacías.

## Rutas y arranque

`DomainServiceProvider`, registrado en `bootstrap/providers.php`, utiliza `Shared/Support/ModuleRouteRegistrar` para cargar los archivos `routes/web.php` y `routes/api.php` existentes de cada dominio. Las rutas web conservan el grupo `web`; las API conservan el grupo `api` y el prefijo `/api`. El registro respeta la caché de rutas de Laravel.

Los archivos raíz `routes/web.php` y `routes/api.php` conservan las rutas globales. Los archivos anteriores de rutas por área se consolidaron dentro de sus dominios. Los imports de acciones generadas por Wayfinder en el frontend se actualizaron para los controladores trasladados.

## Compatibilidad con datos existentes

El esquema de las tablas no cambia. Pint ajustó formato, comentarios y un import no utilizado de las migraciones históricas; se verificó que los tokens ejecutables restantes coinciden con los originales. `AppServiceProvider` conserva las claves polimórficas históricas (`App\\Models\\Dossier`, por ejemplo) mediante un morph map hacia las nuevas clases. Esto permite consultar y crear documentos, notificaciones, solicitudes y recursos sin reescribir las columnas de tipos de la base de datos.

Los filtros que comparaban directamente el namespace usan ahora `getMorphClass()`. Las factories de User y Person se vinculan explícitamente a sus modelos trasladados.

## Preparación local y despliegue

Después de obtener estos cambios:

```sh
composer install
php artisan optimize:clear
npm ci
npm run build
```

Si el despliegue utiliza workers de cola persistentes, deben reiniciarse con el código nuevo. Revisar trabajos pendientes que puedan contener clases serializadas con namespaces anteriores antes del despliegue. No se cambió la base de datos ni se ejecutaron migraciones sobre un servidor.

Las carpetas vacías reservadas no incluyen interfaces, políticas, jobs ni endpoints nuevos. Tampoco se aplicaron los cambios de almacenamiento privado, reglas de negocio o bolsa laboral descritos como propuestas en `Backend.md`.

## Validación final — 21 de octubre de 2026

La suite original partía de 48 pruebas fallidas y 2 correctas. Después de corregir sus causas y ampliar los casos de regresión, estos son los resultados locales:

| Control | Resultado |
| --- | --- |
| Pest completo | 91 pruebas aprobadas, 396 aserciones; sin fallos, errores ni omisiones |
| Contrato de rutas | 147 rutas conservadas: métodos, URI, nombres y middleware |
| Arquitectura | 11 pruebas y 149 aserciones aprobadas |
| Caché de rutas y Wayfinder | Correctos |
| Pint (`composer test:lint`) | 272 archivos aprobados |
| Prettier (`npm run format:check`) | Aprobado |
| ESLint (`eslint . --max-warnings 0`) | Cero errores y advertencias |
| TypeScript (`npm run types`) | Sin errores |
| Vite (`npm run build`) | Compilación correcta |
| Git (`git diff --check`) | Sin errores de espacios |

`tests/Feature/System/OperationalFlowsTest.php` cubre 22 accesos a pantallas por perfil y flujos HTTP de estructura académica, registro, expediente con observación/corrección/aprobación, grupos, permisos, bloqueo de escritura en semestres cerrados, formalización con empresa y revisión de anexos con notificación al supervisor.

### Correcciones verificadas

- Factories con la persona requerida, entorno de pruebas aislado y acceso sin semestre activo.
- Nombres UUID en documentos para evitar sobreescrituras entre cargas del mismo segundo.
- RUC incluido en la consulta de empresa y su respuesta HTTP.
- Notificación de aprobación mediante la relación real del supervisor del grupo.
- Contratos TypeScript, hooks React, filtros, paginación, formularios y previsualización de archivos; sin desactivar reglas del código fuente.
- Generación de Wayfinder antes de comprobar frontend y tipos en GitHub Actions, necesaria en un clon limpio.

### Alcance de las comprobaciones

Las pruebas automáticas utilizan `.env.testing`, SQLite en memoria y almacenamiento simulado. La revisión en navegador utiliza una base SQLite exclusiva dentro de `output/backend_reorganization`. Se verificaron ingreso de administrador y estudiante, carga de sus dashboards, recursos administrativos y expediente del estudiante, incluido el cambio de documento seleccionado. No se capturaron errores JavaScript en ese recorrido.

Las estadísticas de los dashboards siguen siendo demostrativas y los recursos del administrador global conservan una pantalla provisional existente. Estas funciones y la bolsa laboral futura no se implementan en esta reorganización.

La validación es local: no se modificó la base desplegada ni se comprobaron correo real, servicios externos o el motor de base de datos de producción. Las pruebas validan los casos cubiertos.

Para repetir los controles:

```sh
php artisan wayfinder:generate --with-form
composer test:lint
php vendor/bin/pest --compact
npm run format:check
npx eslint . --max-warnings 0
npm run types
npm run build
```

Los resultados detallados están en `output/backend_reorganization`, ignorado por Git. Los cambios permanecen en `aldo`, sin commit, push ni integración a `main`.

## Integración con main

Se incorporaron los commits de main hasta `4dc3827`, conservando la reorganización y las correcciones de `c692962`. Las ocho migraciones futuras agregadas vacías en main se conservan con extensión `.php.gitkeep`: con extensión `.php`, Laravel intentaba ejecutarlas y fallaba por ausencia de clase. Se mantienen las carpetas de pruebas y se respeta la eliminación de dos tests de ejemplo sin cobertura real. Por ello, la suite pasa de 91 a 89 pruebas y de 396 a 394 aserciones.
