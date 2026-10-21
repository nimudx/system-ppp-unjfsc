<p align="center">
  <a href="https://github.com/nimudx/system-ppp-unjfsc">
    <img src="public/ins-unjfsc.png" alt="Logo UNJFSC" width="120" height="120">
  </a>
</p>

<h1 align="center">Sistema de Gestión de Prácticas Pre-Profesionales (UNJFSC)</h1>

<p align="center">
  ¡Bienvenido al repositorio oficial del Sistema de Gestión de Prácticas Pre-Profesionales para la Universidad Nacional José Faustino Sánchez Carrión! Este sistema está diseñado bajo una arquitectura robusta, modular y de alto rendimiento utilizando un stack moderno full-stack.
</p>

### Stack Tecnológico

* **Backend:** Laravel (PHP) ![version](https://img.shields.io/badge/version-12.0.0-red) ![version](https://img.shields.io/badge/version-8.2-blue)
* **Frontend:** React + Inertia.js ![version](https://img.shields.io/badge/version-19.2.0-blue)
* **Estilos y UI:** Tailwind CSS + Shadcn UI ![version](https://img.shields.io/badge/porcent-90%25-brightgreen)
* **Base de Datos:** MariaDB ![version](https://img.shields.io/badge/version-10.11-blue)
* **Entorno y Despliegue:** Docker & Docker Compose
* **Seguridad:** Cloudflare Proxy / Tunnels (Producción)

---

### Estructura Principal del Proyecto

```text
├── app/                     # Backend: controladores, modelos, servicios, middleware
├── config/                  # Configuración de Laravel
├── database/                # Migraciones, factories y seeders (MariaDB)
├── docker/                  # Dockerfile y entrypoint de la imagen de producción (PHP-FPM)
├── docs/                    # Documentación del equipo (Frontend.md, Backend.md, ...)
├── resources/
│   ├── css/app.css          # Tailwind + tema (paleta lochmara, claro/oscuro)
│   ├── js/
│   │   ├── app.tsx          # Punto de entrada de React + Inertia
│   │   ├── shared/          # Lo común: ui (shadcn), layouts, hooks, lib, tipos
│   │   ├── modules/         # Un módulo por área: identity, academic, dossier, ...
│   │   │   └── <módulo>/    #   pages/, components/, hooks/ e index.ts (API pública)
│   │   ├── routes/          # Generado por Wayfinder (no editar)
│   │   └── actions/         # Generado por Wayfinder (no editar)
│   └── views/app.blade.php  # Plantilla raíz
├── routes/                  # Rutas web.php, api.php y por área
├── docker-compose.yml       # Desarrollo: solo la base de datos (MariaDB)
├── docker-compose.prod.yml  # Producción: app (PHP-FPM) + base de datos
└── vite.config.ts           # Configuración de Vite
```

La organización del frontend y sus reglas están en [docs/Frontend.md](docs/Frontend.md). En resumen: cada página vive en `resources/js/modules/<módulo>/pages/` y el controlador la nombra como `'<módulo>/<ruta>'`, por ejemplo `Inertia::render('identity/auth/login')` → `modules/identity/pages/auth/login.tsx`.
---

### 1. Modo Desarrollo (Local - Híbrido)

En el entorno de desarrollo, la base de datos corre aislada en un contenedor Docker, mientras que Laravel y React se ejecutan de forma nativa en tu máquina local para facilitar una depuración rápida y aprovechar el *hot-reload*.

### Prerrequisitos
Asegúrate de tener instalado en tu sistema local:
* Docker & Docker Compose
* PHP 8.2+ & Composer
* Node.js (v18+ recomendado) & NPM

**Extensiones de PHP requeridas:** `pdo_mysql` e `iconv` (usada por `laravel/fortify`).
En distros como Arch/CachyOS, PHP suele traer estas extensiones compiladas pero **deshabilitadas por defecto** (comentadas con `;` en `php.ini`). Verifica con:
```bash
php -m | grep -E "pdo_mysql|iconv"
```
Si no aparece alguna, localiza tu `php.ini` con `php --ini` y descoméntala:
```bash
sudo sed -i -e 's/^;extension=pdo_mysql/extension=pdo_mysql/' -e 's/^;extension=iconv/extension=iconv/' /etc/php/php.ini
```
Sin esto, `composer install` falla pidiendo `ext-iconv`, y `php artisan migrate` falla con "could not find driver".

#### Pasos para Inicializar en Local

1. **Clonar el repositorio (rama por defecto/main):**
   ```bash
   git clone https://github.com/nimudx/system-ppp-unjfsc.git
   cd system-ppp-unjfsc
   ```
2. **Configurar el archivo de entorno local**
    ```bash
    cp .env.example .env
    ```
    Nota crítica: `.env.example` trae `DB_CONNECTION=sqlite` por defecto. Ábrelo y reemplaza el bloque de base de datos por:
    ```env
    DB_CONNECTION=mysql
    DB_HOST=127.0.0.1
    DB_PORT=3307
    DB_DATABASE=db_system_ppp
    DB_USERNAME=root
    DB_PASSWORD=root123
    ```
    Estos valores deben coincidir con el servicio `db-dev` de `docker-compose.yml` (puerto mapeado 3307→3306, `MYSQL_DATABASE` y `MYSQL_ROOT_PASSWORD`).
3. **Instalar dependencias del backend e iniciar la Base de Datos**
    ```bash
    # Instalar paquetes de Composer locales
    composer install
    
    # Generar la clave única de la aplicación
    php artisan key:generate
    
    # Levantar el contenedor de MariaDB en segundo plano
    docker compose up -d
    ```
4. **Ejecutar Migraciones y Poblado de Datos (Seeds)**
    ```bash
    php artisan migrate --seed
    ```
    Nota: Si el comando falla indicando que busca el puerto 3306, limpia la caché de configuración con **php artisan config:clear** o fuerza el puerto ejecutando: DB_PORT=3307 **php artisan migrate --seed**.

    Esto crea los roles, los tipos de usuario y el administrador inicial (`admin@unjfsc.edu.pe` / `12345678`).

    Para trabajar con datos de prueba (facultades, escuelas, secciones del ciclo 2026-I, tipos de documento y usuarios de cada rol), ejecuta además, en este orden:
    ```bash
    php artisan db:seed --class=Cycle2026Seeder
    php artisan db:seed --class=DocumentTypeRoleSeeder
    ```

    Usuarios de prueba (contraseña para todos: `12345678`):

    | Email | Rol |
    |---|---|
    | `admin@unjfsc.edu.pe` | Administrador |
    | `nicasio@gmail.com`, `admin2@gmail.com` | Administrador |
    | `subadmin1@gmail.com`, `subadmin2@gmail.com` | Sub Administrador |
    | `docente1@gmail.com`, `docente2@gmail.com` | Docente Titular |
    | `supervisor1@gmail.com`, `supervisor2@gmail.com` | Docente Supervisor |
    | `estudiante1@gmail.com`, `estudiante2@gmail.com` | Estudiante |

    > **¿No puedes ingresar con `12345678`?** Los seeders usan `firstOrCreate`: si el usuario ya existía en tu base (por ejemplo, de una instalación anterior), **no le cambian la contraseña**. Restablécela con:
    > ```bash
    > php artisan tinker --execute="App\Models\User::where('email','admin@unjfsc.edu.pe')->update(['password' => Hash::make('12345678')]);"
    > ```
5. **Instalar dependencias del frontend**
    ```bash
    npm install
    ```
6. **Ejecución del Entorno de Desarrollo**
    Para comenzar a trabajar, necesitas levantar tanto el servidor de PHP como el compilador de Vite. Ejecuta los siguientes comandos (se recomienda usar pestañas de terminal separadas):
    ```bash
    composer run dev
    ```

    http://localhost:8000

    **En Windows:** `composer run dev` falla porque también lanza `php artisan pail`, que requiere la extensión `pcntl` (no existe en PHP para Windows), y al caer arrastra a los demás procesos (`--kill-others`). Usa el mismo comando sin `pail`:
    ```bash
    npx concurrently -c "#93c5fd,#c4b5fd,#fdba74" "php artisan serve" "php artisan queue:listen --tries=1 --timeout=0" "npm run dev" --names=server,queue,vite --kill-others
    ```
    Recuerda tener Docker Desktop abierto y el contenedor de la base de datos levantado (`docker compose up -d`) antes de iniciar.

    **Si aparece `ViteManifestNotFoundException`:** Laravel no encuentra `public/hot`, el archivo con el que Vite avisa que está corriendo.
    * Espera a ver `VITE ... ready` en la terminal antes de abrir el navegador, y recarga la página.
    * Mantén **un solo** servidor de desarrollo abierto. Si arrancas un segundo, su Vite no consigue el puerto 5173, se cierra y al cerrarse borra `public/hot`. Detén el que sobra con `Ctrl + C` y vuelve a lanzar uno.

---

### 2. Modo Producción (VPS + Docker Completo)
El entorno de producción corre 100% en contenedores dentro del VPS: la app (PHP-FPM) y MariaDB, definidos en `docker-compose.prod.yml`. El Caddy del VPS sirve los archivos públicos y le pasa las peticiones a PHP-FPM; el tráfico externo entra por Cloudflare, así que el servidor no expone puertos públicos.

#### Despliegue automático (flujo normal)
No hace falta entrar al VPS: **cada push a `main` despliega solo** mediante el workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml):

1. Construye la imagen de producción (`docker/Dockerfile`, incluye `npm run build`) y la publica en GHCR.
2. Se conecta por SSH al VPS, actualiza el código (`git pull origin main`) y escribe el `.env` de producción desde los secretos de GitHub.
3. Ejecuta `docker compose -f docker-compose.prod.yml pull`, `up -d` y `php artisan migrate --force` dentro del contenedor `app`.

Si el build falla, el despliegue no se ejecuta y producción sigue con la versión anterior. Por eso los cambios se integran con un Pull Request hacia `main`, no con push directo.

#### Despliegue manual (solo si hiciera falta)
Desde la carpeta del proyecto en el VPS:
```bash
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml exec -T app php artisan migrate --force
```
El `docker/entrypoint.sh` del contenedor ya regenera las cachés de configuración, rutas y vistas en cada arranque.

El sistema responde en **https://practicaspre.kerpun.com**

## Licencia

Este proyecto está bajo la licencia **Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0)**.

A efectos prácticos, esto significa que:
* **Permitido:** Puedes ver, descargar, estudiar y compartir el código con fines académicos y de aprendizaje.
* **Atribución:** Se debe dar el crédito correspondiente de manera adecuada, proporcionando un enlace a este repositorio.
* **No Comercial:** No puedes utilizar este proyecto, su código o sus componentes para fines comerciales o lucrativos.
* **Sin Derivadas:** Si remezclas, transformas o creas a partir de este material, no puedes distribuir el material modificado.

Para más detalles, puedes revisar el archivo [LICENSE](LICENSE) o visitar [Creative Commons](https://creativecommons.org/licenses/by-nc-nd/4.0/deed.es).
