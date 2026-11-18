Actúa como un desarrollador frontend senior especializado en Laravel, Inertia.js, React, TypeScript y Tailwind CSS.

Quiero que implementes una **pantalla de carga (Global Loading Screen)** para mi sistema de gestión de prácticas preprofesionales de la Universidad Nacional José Faustino Sánchez Carrión (UNJFSC).

### 1. Contexto del proyecto

- Backend: Laravel.
- Frontend: React + TypeScript.
- Navegación: Inertia.js.
- Estilos: Tailwind CSS.
- Arquitectura: componentes reutilizables y organizados dentro de la estructura existente del proyecto.
- Logo institucional disponible en: `public/ins-unjfsc.png`.

No modifiques la configuración de autenticación, Laravel Fortify, middleware, rutas ni lógica de permisos. Esta implementación debe ser exclusivamente visual y estar integrada con el sistema de navegación existente.

### 2. Referencia visual

Toma como inspiración el loader del Aula Virtual de la UNJFSC.

La pantalla debe tener las siguientes características:

- Fondo azul institucional: `#3F94D5`.
- Logo institucional ubicado en la parte superior del indicador de carga.
- Utilizar exactamente el archivo `public/ins-unjfsc.png` como imagen del logo.
- Indicador de carga animado debajo del logo.
- Diseño minimalista, institucional, moderno y elegante.
- Elementos centrados tanto vertical como horizontalmente.
- La pantalla debe ocupar el 100% del viewport.
- Debe cubrir temporalmente toda la interfaz mientras se realiza la navegación.

### 3. Diseño y animaciones

Quiero una experiencia visual profesional:

- Mostrar el logo institucional con dimensiones proporcionales, sin deformarlo.
- Incorporar una animación de carga circular o giratoria debajo del logo.
- La animación debe ser fluida, continua y sin saltos.
- Aplicar una transición de aparición y desaparición mediante opacidad.
- Evitar efectos exagerados, elementos innecesarios o animaciones que distraigan.
- Utilizar un indicador de carga visualmente coherente con la identidad institucional.
- Si el logo tiene fondo transparente, conservarlo.
- No agregar textos inventados, slogans ni logotipos adicionales.

### 4. Comportamiento funcional

La pantalla debe funcionar como un cargador global:

**Durante la navegación:**

- Detectar los eventos `start` y `finish` de Inertia.js.
- Mostrar el loader cuando comienza una navegación.
- Ocultarlo cuando termina la navegación.
- También contemplar el evento `navigate` si es necesario para mantener correctamente sincronizado el estado.
- Evitar que el loader se quede visible indefinidamente.
- Evitar parpadeos durante navegaciones muy rápidas, aplicando un pequeño retraso antes de mostrarlo.

**Durante la carga inicial:**

- Evaluar la posibilidad de mostrar una pantalla de carga desde el documento Blade de Inertia antes de que React termine de inicializarse.
- Ocultarla cuando la aplicación esté lista.
- No duplicar el loader ni generar conflictos entre el HTML inicial y React.

**En dispositivos:**

- Debe ser completamente responsive.
- Funcionar correctamente en escritorio, tablet y móvil.
- Mantener el logo centrado y con dimensiones adecuadas en pantallas pequeñas.

### 5. Organización del código

Antes de implementar:

1. Inspecciona la estructura actual del proyecto.
2. Identifica dónde se encuentra el `AppLayout`.
3. Identifica el punto principal donde se inicializa Inertia.
4. Revisa cómo están organizados los componentes compartidos.
5. Identifica el archivo Blade que sirve como plantilla principal de Inertia.

Después, implementa el loader siguiendo la arquitectura existente.

Preferiblemente, crea un componente reutilizable llamado `GlobalLoader`, ubicado en la carpeta de componentes compartidos, respetando las convenciones actuales del proyecto.

Integra el componente en el lugar adecuado para que funcione globalmente y no tengas que agregarlo manualmente a cada página.

### 6. Restricciones importantes

- No reemplazar ni modificar el sistema de login.
- No alterar Laravel Fortify.
- No modificar los roles ni permisos.
- No cambiar las rutas existentes.
- No modificar la lógica de los controladores.
- No instalar dependencias innecesarias.
- No reemplazar el `AppLayout` actual.
- No modificar componentes que no estén relacionados con esta funcionalidad.
- No utilizar imágenes externas.
- No utilizar un logo diferente al archivo `public/ins-unjfsc.png`.
- No generar una pantalla de carga independiente que no esté conectada a los eventos reales de Inertia.

### 7. Resultado esperado

Quiero que, al navegar entre las diferentes secciones del sistema, aparezca una pantalla azul institucional con el logo de la UNJFSC y un indicador animado de carga.

La experiencia debe sentirse como parte oficial del sistema, no como un componente genérico.

### 8. Entrega

Al finalizar:

- Indica todos los archivos creados y modificados.
- Explica brevemente dónde se integró el componente.
- Muestra el código completo de los archivos nuevos.
- Explica cómo funciona la detección de navegación de Inertia.
- Indica cómo se controla la carga inicial.
- Verifica que no existan errores de TypeScript ni problemas de compilación.
- No elimines ni reemplaces funcionalidades existentes.

**Importante:** primero analiza el proyecto y después implementa. No supongas nombres de archivos, rutas o componentes sin inspeccionar la estructura real.
