<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Activar cuenta — Sistema PPP UNJFSC</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
            --primary:       #1e3a5f;
            --primary-hover: #163050;
            --accent:        #2d6a9f;
            --danger:        #e53e3e;
            --danger-bg:     #fff5f5;
            --danger-border: #feb2b2;
            --success:       #276749;
            --border:        #d1d5db;
            --bg:            #f0f4f8;
            --card:          #ffffff;
            --text:          #1a202c;
            --muted:         #6b7280;
            --input-focus:   #2d6a9f;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: var(--bg);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px 16px;
        }

        .container {
            width: 100%;
            max-width: 440px;
        }

        /* Logo / cabecera */
        .brand {
            text-align: center;
            margin-bottom: 28px;
        }
        .brand-icon {
            width: 56px;
            height: 56px;
            background: linear-gradient(135deg, var(--primary), var(--accent));
            border-radius: 14px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 14px;
            box-shadow: 0 4px 16px rgba(30,58,95,0.25);
        }
        .brand-icon svg { width: 28px; height: 28px; fill: none; stroke: #fff; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
        .brand h1 { font-size: 20px; font-weight: 700; color: var(--primary); }
        .brand p  { font-size: 13px; color: var(--muted); margin-top: 4px; }

        /* Tarjeta */
        .card {
            background: var(--card);
            border-radius: 16px;
            box-shadow: 0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04);
            padding: 36px 36px 32px;
        }

        .card-header { margin-bottom: 28px; }
        .card-header h2 { font-size: 22px; font-weight: 700; color: var(--text); }
        .card-header .subtitle {
            font-size: 14px; color: var(--muted); margin-top: 6px; line-height: 1.5;
        }
        .card-header .email-badge {
            display: inline-block;
            background: #ebf4ff;
            color: var(--accent);
            font-size: 13px;
            font-weight: 500;
            padding: 4px 10px;
            border-radius: 6px;
            margin-top: 8px;
        }

        /* Errores globales */
        .alert-error {
            background: var(--danger-bg);
            border: 1px solid var(--danger-border);
            border-radius: 8px;
            padding: 12px 14px;
            margin-bottom: 20px;
            font-size: 14px;
            color: var(--danger);
        }
        .alert-error ul { padding-left: 18px; }
        .alert-error li { margin-top: 4px; }

        /* Formulario */
        .form-group { margin-bottom: 20px; }

        label {
            display: block;
            font-size: 14px;
            font-weight: 500;
            color: var(--text);
            margin-bottom: 6px;
        }

        .input-wrapper { position: relative; }

        input[type="password"] {
            width: 100%;
            padding: 11px 42px 11px 14px;
            border: 1.5px solid var(--border);
            border-radius: 8px;
            font-size: 15px;
            font-family: inherit;
            color: var(--text);
            background: #fff;
            transition: border-color 0.18s, box-shadow 0.18s;
            outline: none;
        }
        input[type="password"]:focus {
            border-color: var(--input-focus);
            box-shadow: 0 0 0 3px rgba(45,106,159,0.12);
        }
        input[type="password"].has-error {
            border-color: var(--danger);
            box-shadow: 0 0 0 3px rgba(229,62,62,0.10);
        }

        /* Botón ojo */
        .toggle-pw {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            cursor: pointer;
            color: var(--muted);
            padding: 2px;
            display: flex;
            align-items: center;
        }
        .toggle-pw:hover { color: var(--text); }
        .toggle-pw svg { width: 18px; height: 18px; }

        /* Mensaje de error por campo */
        .field-error {
            font-size: 12.5px;
            color: var(--danger);
            margin-top: 5px;
            display: flex;
            align-items: center;
            gap: 4px;
        }

        /* Indicador de fuerza de contraseña */
        .strength-bar {
            margin-top: 8px;
            display: flex;
            gap: 4px;
        }
        .strength-bar span {
            flex: 1;
            height: 4px;
            border-radius: 2px;
            background: #e5e7eb;
            transition: background 0.25s;
        }
        .strength-label {
            font-size: 11.5px;
            color: var(--muted);
            margin-top: 4px;
        }

        /* Botón submit */
        .btn-submit {
            width: 100%;
            padding: 13px;
            background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
            color: #fff;
            border: none;
            border-radius: 8px;
            font-size: 15px;
            font-weight: 600;
            font-family: inherit;
            cursor: pointer;
            transition: opacity 0.18s, transform 0.12s;
            margin-top: 8px;
            letter-spacing: 0.2px;
        }
        .btn-submit:hover { opacity: 0.92; }
        .btn-submit:active { transform: scale(0.99); }

        /* Info de requisitos */
        .requirements {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 12px 14px;
            margin-bottom: 20px;
        }
        .requirements p {
            font-size: 12.5px;
            color: var(--muted);
            line-height: 1.6;
        }
        .requirements p strong { color: var(--text); }

        /* Footer */
        .card-footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12.5px;
            color: var(--muted);
        }
    </style>
</head>
<body>
<div class="container">

    <!-- Marca / Institución -->
    <div class="brand">
        <div class="brand-icon">
            <!-- Candado SVG -->
            <svg viewBox="0 0 24 24">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
        </div>
        <h1>Sistema PPP — UNJFSC</h1>
        <p>Prácticas Pre-Profesionales</p>
    </div>

    <!-- Tarjeta principal -->
    <div class="card">
        <div class="card-header">
            <h2>Crea tu contraseña</h2>
            <p class="subtitle">
                Hola, <strong>{{ $userName }}</strong>. Tu cuenta ha sido creada. Establece tu contraseña para empezar.
            </p>
            <span class="email-badge">{{ $email }}</span>
        </div>

        {{-- Errores de validación --}}
        @if ($errors->any())
            <div class="alert-error">
                <ul>
                    @foreach ($errors->all() as $error)
                        <li>{{ $error }}</li>
                    @endforeach
                </ul>
            </div>
        @endif

        <!-- Requisitos -->
        <div class="requirements">
            <p><strong>Requisitos de contraseña:</strong> mínimo 8 caracteres. Te recomendamos combinar letras, números y símbolos.</p>
        </div>

        <form method="POST" action="{{ route('activate.store', ['token' => $token]) }}" id="activateForm">
            @csrf

            <!-- Contraseña -->
            <div class="form-group">
                <label for="password">Nueva contraseña</label>
                <div class="input-wrapper">
                    <input
                        type="password"
                        id="password"
                        name="password"
                        autocomplete="new-password"
                        class="{{ $errors->has('password') ? 'has-error' : '' }}"
                        placeholder="••••••••"
                        oninput="checkStrength(this.value)"
                        required
                    >
                    <button type="button" class="toggle-pw" onclick="toggleVisibility('password', this)" title="Mostrar/ocultar contraseña">
                        <svg id="eye-password" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                        </svg>
                    </button>
                </div>
                <!-- Barra de fuerza -->
                <div class="strength-bar">
                    <span id="bar1"></span><span id="bar2"></span><span id="bar3"></span><span id="bar4"></span>
                </div>
                <div class="strength-label" id="strengthLabel"></div>
                @error('password')
                    <p class="field-error">⚠ {{ $message }}</p>
                @enderror
            </div>

            <!-- Confirmación -->
            <div class="form-group">
                <label for="password_confirmation">Confirmar contraseña</label>
                <div class="input-wrapper">
                    <input
                        type="password"
                        id="password_confirmation"
                        name="password_confirmation"
                        autocomplete="new-password"
                        class="{{ $errors->has('password_confirmation') ? 'has-error' : '' }}"
                        placeholder="••••••••"
                        required
                    >
                    <button type="button" class="toggle-pw" onclick="toggleVisibility('password_confirmation', this)" title="Mostrar/ocultar contraseña">
                        <svg id="eye-password_confirmation" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                        </svg>
                    </button>
                </div>
                @error('password_confirmation')
                    <p class="field-error">⚠ {{ $message }}</p>
                @enderror
            </div>

            <button type="submit" class="btn-submit">
                Activar cuenta y guardar contraseña
            </button>
        </form>
    </div>

    <div class="card-footer">
        © {{ date('Y') }} Universidad Nacional José Faustino Sánchez Carrión
    </div>
</div>

<script>
    // Mostrar/ocultar contraseña
    function toggleVisibility(fieldId, btn) {
        const input = document.getElementById(fieldId);
        const isHidden = input.type === 'password';
        input.type = isHidden ? 'text' : 'password';

        const svg = btn.querySelector('svg');
        if (isHidden) {
            // Ojo tachado
            svg.innerHTML = `
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
            `;
        } else {
            svg.innerHTML = `
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
            `;
        }
    }

    // Indicador de fuerza de contraseña
    function checkStrength(password) {
        const bars   = [document.getElementById('bar1'), document.getElementById('bar2'), document.getElementById('bar3'), document.getElementById('bar4')];
        const label  = document.getElementById('strengthLabel');
        const colors = ['#e53e3e', '#f6c90e', '#38a169', '#276749'];
        const labels = ['Muy débil', 'Débil', 'Buena', 'Fuerte'];

        let score = 0;
        if (password.length >= 8)                       score++;
        if (/[A-Z]/.test(password))                     score++;
        if (/[0-9]/.test(password))                     score++;
        if (/[^A-Za-z0-9]/.test(password))              score++;

        bars.forEach((bar, i) => {
            bar.style.background = i < score ? colors[score - 1] : '#e5e7eb';
        });

        label.textContent  = password.length > 0 ? labels[score - 1] ?? '' : '';
        label.style.color  = score > 0 ? colors[score - 1] : '#6b7280';
    }
</script>
</body>
</html>
