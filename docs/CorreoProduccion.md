# Enviar invitaciones desde el VPS mediante GitHub

## Qué quedó preparado

Al llegar los cambios a `main`, el workflow de despliegue:

1. Comprueba que se configuraron el servidor de correo, usuario, credencial y remitente. Si faltan, falla antes de publicar la imagen o modificar el VPS.
2. Construye y publica la imagen Docker existente.
3. Se conecta al VPS con la clave de despliegue que ya utiliza GitHub.
4. Genera el `.env` de producción con `MAIL_MAILER=smtp` y las credenciales suministradas por GitHub. Los valores no se imprimen en los logs.
5. Descarga la imagen y detiene la cola anterior para que no ejecute trabajos durante las migraciones.
6. Espera a que la base de datos y la aplicación estén listas, aplica las migraciones existentes y arranca `queue-prod` con el código y configuración nuevos.

La cola procesa `database/default`, se reinicia automáticamente con Docker y permite tres intentos por trabajo. El timeout de SMTP es de 30 segundos, el del trabajo de 60 y `retry_after` conserva los 90 segundos del proyecto. No debe aumentarse el timeout del trabajo por encima de `retry_after`.

No se agregan migraciones ni se cambian los datos de las empresas. El despliegue conserva el paso existente `php artisan migrate --force` para aplicar cualquier migración pendiente del proyecto.

## 1. Crear la cuenta remitente

Todavía no se ha creado ni configurado una cuenta. Utilizar una cuenta dedicada al proyecto.

Si eligen Gmail:

1. Crear la cuenta y activar la verificación en dos pasos.
2. Si Google habilita esa opción para la cuenta, generar una contraseña de aplicación para el sistema de prácticas. No utilizar la contraseña habitual de la cuenta.
3. Registrar esa contraseña de aplicación directamente como `MAIL_PASSWORD` en GitHub. No copiarla a mensajes, archivos del repositorio ni capturas.

Google puede no ofrecer contraseñas de aplicación en determinadas cuentas o configuraciones de seguridad. En ese caso se debe revisar la configuración de la cuenta o utilizar otro proveedor con credenciales SMTP autorizadas.

Referencias: [contraseñas de aplicación de Google](https://support.google.com/accounts/answer/185833?hl=es), [configuración SMTP de Gmail](https://support.google.com/mail/answer/7104828).

## 2. Registrar los datos en GitHub

Repositorio → **Settings → Secrets and variables → Actions**. Para administrar secretos por la interfaz pueden requerirse permisos de propietario/administrador; ser colaborador no garantiza que aparezcan esas opciones. Si faltan, solicitar al administrador que registre los valores. No es necesario compartir la clave SSH personal del VPS.

En **Secrets → New repository secret**:

| Nombre exacto | Valor |
| --- | --- |
| `MAIL_USERNAME` | Dirección completa de la cuenta que enviará los mensajes |
| `MAIL_PASSWORD` | Credencial SMTP; para Gmail, la contraseña de aplicación |

En **Variables → New repository variable**:

| Nombre exacto | Valor para Gmail | Uso |
| --- | --- | --- |
| `MAIL_HOST` | `smtp.gmail.com` | Servidor de envío |
| `MAIL_PORT` | `587` | Puerto; se usa 587 si se omite |
| `MAIL_SCHEME` | `smtp` | STARTTLS automático; para TLS implícito usar `smtps` y el puerto indicado por el proveedor |
| `MAIL_FROM_ADDRESS` | La misma cuenta configurada en `MAIL_USERNAME` | Remitente autorizado |
| `MAIL_FROM_NAME` | `Sistema de Prácticas UNJFSC` | Nombre visible; este es el valor predeterminado |

Para otro proveedor, utilizar sus parámetros SMTP; no asumir que la contraseña normal funciona. Conservar los secretos y variables de despliegue existentes (`APP_KEY`, `DB_PASSWORD`, `VPS_SSH_KEY`, `VPS_HOST`, `VPS_USER`, `VPS_APP_PATH`, `APP_URL`, `DB_DATABASE`).

`APP_URL` debe ser la dirección pública correcta del sistema: es la base de los enlaces de activación.

## 3. Publicar y probar

1. Configurar los valores anteriores antes de integrar estos cambios en `main`. Mientras falten, el despliegue fallará con un mensaje que identifica los nombres faltantes.
2. Hacer commit/push en la rama de trabajo y revisar/integrar el cambio siguiendo el flujo del equipo hasta `main`. Un push a `aldo` o `develop` no despliega al VPS.
3. En GitHub → **Actions → Publicacion de la version - Deploy**, comprobar que la ejecución de `main` terminó correctamente.
4. Como estudiante, abrir Pasantía y reenviar la invitación si está esperando a la empresa. El servidor exige cinco minutos entre envíos.
5. Revisar el buzón destinatario y spam. Probar con un correo controlado por el equipo y abrir el enlace más reciente. Las invitaciones de activación vencen a las 72 horas; un reenvío revoca el enlace anterior.

La validación del workflow comprueba presencia y formato de la configuración, no la autenticación SMTP ni la entrega al buzón. Hasta completar esta prueba no debe afirmarse que el correo real funciona. Se debe autorizar la salida de red del VPS al puerto SMTP; si el proveedor del VPS la bloquea, corresponde al administrador resolverlo o elegir un proveedor y puerto permitidos.

El remitente es la cuenta de envío; el correo registrado de cada empresa es el destinatario. No sustituir automáticamente los destinatarios reales por la cuenta de pruebas.

## Diagnóstico para el administrador del VPS

Desde la carpeta del proyecto:

```sh
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs --tail=100 queue
docker compose -f docker-compose.prod.yml exec -T app php artisan queue:failed
```

- Error `535`/autenticación: revisar usuario, credencial de aplicación y permisos del remitente.
- Conexión rechazada o timeout: revisar servidor, puerto y salida de red del VPS.
- Error de permisos en `storage`: la aplicación y el worker (`www-data`) deben poder escribir en `storage-data`.
- Trabajo fallido: después de corregir la causa, el administrador puede reintentar el UUID concreto con `php artisan queue:retry UUID` dentro del contenedor. No ejecutar reintentos masivos ni limpiar colas a ciegas.
- El worker puede procesar invitaciones antiguas que seguían pendientes. Si el enlace ya expiró, generar un reenvío nuevo desde Pasantía; las que se procesaron con `MAIL_MAILER=log` no vuelven a enviarse por cambiar la configuración.

El contenedor worker no expone puertos y no modifica los archivos públicos en sus reinicios. La salud de PHP-FPM solo se comprueba para `app`, no para la cola.

## Validación local sin enviar correo

```sh
python -m unittest discover -s tests/deployment -v
php vendor/bin/pint --dirty --test
php vendor/bin/pest tests/Feature/Company --compact
```

Las pruebas usan credenciales ficticias y comprueban validación, serialización segura de `.env`, compatibilidad con Laravel y resolución del Compose sin arrancar servicios ni conectarse al VPS.

Referencias técnicas: [orden de arranque en Docker Compose](https://docs.docker.com/compose/how-tos/startup-order/), [workers y timeouts de Laravel](https://laravel.com/docs/12.x/queues).
