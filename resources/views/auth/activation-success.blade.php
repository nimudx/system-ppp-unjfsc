<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>¡Cuenta activada! — Sistema PPP UNJFSC</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: #f0f4f8;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px 16px;
        }
        .card {
            background: #ffffff;
            border-radius: 16px;
            box-shadow: 0 4px 24px rgba(0,0,0,0.08);
            padding: 48px 40px;
            max-width: 420px;
            width: 100%;
            text-align: center;
        }
        .icon-circle {
            width: 72px;
            height: 72px;
            background: linear-gradient(135deg, #276749, #38a169);
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 24px;
            box-shadow: 0 4px 16px rgba(39,103,73,0.25);
            animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
        }
        @keyframes popIn {
            0%   { transform: scale(0.5); opacity: 0; }
            100% { transform: scale(1);   opacity: 1; }
        }
        .icon-circle svg { width: 36px; height: 36px; stroke: #fff; stroke-width: 2.5; fill: none; stroke-linecap: round; stroke-linejoin: round; }
        h1 { font-size: 24px; font-weight: 700; color: #1a202c; margin-bottom: 12px; }
        .subtitle { font-size: 15px; color: #6b7280; line-height: 1.6; margin-bottom: 32px; }
        .subtitle strong { color: #276749; }
        .btn-login {
            display: inline-block;
            background: linear-gradient(135deg, #1e3a5f, #2d6a9f);
            color: #fff;
            text-decoration: none;
            padding: 13px 32px;
            border-radius: 8px;
            font-size: 15px;
            font-weight: 600;
            letter-spacing: 0.2px;
            transition: opacity 0.18s;
        }
        .btn-login:hover { opacity: 0.88; }
        .footer-note {
            font-size: 12px;
            color: #a0aec0;
            margin-top: 24px;
        }
    </style>
</head>
<body>
    <div class="card">
        <!-- Ícono de éxito -->
        <div class="icon-circle">
            <svg viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12"/>
            </svg>
        </div>

        <h1>¡Cuenta activada!</h1>
        <p class="subtitle">
            Tu contraseña ha sido creada correctamente y tu cuenta está ahora <strong>activa</strong>.
            Ya puedes iniciar sesión en la plataforma de Prácticas Pre-Profesionales.
        </p>

        <a href="{{ route('home') }}" class="btn-login">
            Ir al inicio de sesión
        </a>

        <p class="footer-note">
            © {{ date('Y') }} Universidad Nacional José Faustino Sánchez Carrión
        </p>
    </div>
</body>
</html>
