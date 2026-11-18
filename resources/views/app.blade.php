<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    {{-- Inline script to detect system dark mode preference and apply it immediately --}}
    <script>
        (function () {
            const appearance = '{{ $appearance ?? "system" }}';

            if (appearance === 'system') {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                if (prefersDark) {
                    document.documentElement.classList.add('dark');
                }
            }
        })();
    </script>

    {{-- Inline style to set the HTML background color based on our theme in app.css --}}
    <style>
        html {
            background-color: oklch(1 0 0);
        }

        html.dark {
            background-color: #0b0e14;
        }
    </style>

    <title inertia>{{ config('app.name', 'unjfsc.ppp') }}</title>

    <link rel="icon" href="/ins-unjfsc.png" type="image/png">

    {{--
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
    --}}

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Geist&display=swap" rel="stylesheet">

    {{-- Pantalla de carga inicial: se pinta antes de que React monte la aplicación.
         GlobalLoader (resources/js/shared/components/global-loader.tsx) la retira. --}}
    <style>
        #app-loading-splash {
            position: fixed;
            inset: 0;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 2rem;
            background-color: #3f94d5;
            opacity: 1;
            transition: opacity 220ms ease-out;
        }

        #app-loading-splash.is-leaving {
            opacity: 0;
            pointer-events: none;
        }

        #app-loading-splash img {
            width: 6rem;
            height: auto;
            user-select: none;
            filter: drop-shadow(0 8px 20px rgba(15, 37, 67, 0.25));
        }

        #app-loading-splash svg {
            width: 3.5rem;
            height: 3.5rem;
            color: #ffffff;
            animation: app-loading-spin 1s linear infinite;
        }

        @media (min-width: 640px) {
            #app-loading-splash img {
                width: 7rem;
            }
        }

        @media (prefers-reduced-motion: reduce) {
            #app-loading-splash svg {
                animation-duration: 2.4s;
            }
        }

        @keyframes app-loading-spin {
            to {
                transform: rotate(360deg);
            }
        }
    </style>

    @viteReactRefresh
    {{-- 'identity/auth/login' -> resources/js/modules/identity/pages/auth/login.tsx (ver shared/lib/inertia.ts) --}}
    @vite(['resources/js/app.tsx'])
    @inertiaHead
</head>

<body class="font-sans antialiased">
    @inertia

    <div id="app-loading-splash" aria-hidden="true">
        <img src="{{ asset('ins-unjfsc.png') }}" alt="" width="120" height="120">
        <svg viewBox="0 0 50 50" fill="none" aria-hidden="true">
            <circle cx="25" cy="25" r="21" stroke="currentColor" stroke-opacity="0.3" stroke-width="3.5" />
            <circle cx="25" cy="25" r="21" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"
                stroke-dasharray="132" stroke-dashoffset="99" />
        </svg>
    </div>

    {{-- Red de seguridad: retira la pantalla si la aplicación no llega a montarse. --}}
    <script>
        window.setTimeout(function () {
            var splash = document.getElementById('app-loading-splash');

            if (!splash) {
                return;
            }

            splash.classList.add('is-leaving');
            window.setTimeout(function () {
                splash.remove();
            }, 220);
        }, 12000);
    </script>
</body>

</html>