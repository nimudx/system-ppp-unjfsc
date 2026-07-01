<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Activa tu cuenta — Sistema PPP UNJFSC</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, sans-serif;
            background-color: #f0f4f8;
            color: #1a202c;
            line-height: 1.6;
        }
        .wrapper {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }
        .header {
            background: linear-gradient(135deg, #1e3a5f 0%, #2d6a9f 100%);
            padding: 36px 40px;
            text-align: center;
        }
        .header .institution {
            color: #a8d0f0;
            font-size: 11px;
            font-weight: 600;
            letter-spacing: 2px;
            text-transform: uppercase;
            margin-bottom: 8px;
        }
        .header h1 {
            color: #ffffff;
            font-size: 22px;
            font-weight: 700;
            letter-spacing: -0.3px;
        }
        .header .subtitle {
            color: #7ec8f0;
            font-size: 13px;
            margin-top: 4px;
        }
        .badge {
            display: inline-block;
            background: rgba(255,255,255,0.15);
            color: #ffffff;
            font-size: 11px;
            font-weight: 600;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            padding: 4px 12px;
            border-radius: 20px;
            margin-top: 12px;
            border: 1px solid rgba(255,255,255,0.25);
        }
        .body {
            padding: 40px 40px 32px;
        }
        .greeting {
            font-size: 18px;
            font-weight: 600;
            color: #1e3a5f;
            margin-bottom: 16px;
        }
        .body p {
            font-size: 15px;
            color: #4a5568;
            margin-bottom: 16px;
        }
        .cta-container {
            text-align: center;
            margin: 32px 0;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #1e3a5f 0%, #2d6a9f 100%);
            color: #ffffff !important;
            text-decoration: none;
            padding: 14px 36px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            letter-spacing: 0.3px;
            transition: opacity 0.2s;
        }
        .url-fallback {
            background: #f7fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 14px 18px;
            margin: 20px 0;
            word-break: break-all;
        }
        .url-fallback p {
            font-size: 12px;
            color: #718096;
            margin-bottom: 6px !important;
        }
        .url-fallback a {
            font-size: 13px;
            color: #2d6a9f;
            word-break: break-all;
        }
        .expiry-note {
            background: #fff8e1;
            border-left: 4px solid #f6c90e;
            border-radius: 0 6px 6px 0;
            padding: 12px 16px;
            margin: 24px 0;
        }
        .expiry-note p {
            font-size: 13px;
            color: #7d6200;
            margin: 0 !important;
        }
        .expiry-note strong { color: #5a4500; }
        .security-note {
            background: #f0f9ff;
            border-left: 4px solid #2d6a9f;
            border-radius: 0 6px 6px 0;
            padding: 12px 16px;
            margin-top: 20px;
        }
        .security-note p {
            font-size: 13px;
            color: #2c5282;
            margin: 0 !important;
        }
        .footer {
            background: #f7fafc;
            border-top: 1px solid #e2e8f0;
            padding: 24px 40px;
            text-align: center;
        }
        .footer p {
            font-size: 12px;
            color: #a0aec0;
            margin-bottom: 4px;
        }
        .footer strong { color: #718096; }
        .divider {
            height: 1px;
            background: #e2e8f0;
            margin: 24px 0;
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <!-- Cabecera -->
        <div class="header">
            <p class="institution">Universidad Nacional José Faustino Sánchez Carrión</p>
            <h1>Sistema de Prácticas Pre-Profesionales</h1>
            <p class="subtitle">Plataforma de Gestión Académica</p>
            <span class="badge">✉ Activación de cuenta</span>
        </div>

        <!-- Cuerpo -->
        <div class="body">
            <p class="greeting">Hola, {{ $userName }}</p>

            <p>
                El administrador del sistema ha creado una cuenta en la plataforma de
                <strong>Prácticas Pre-Profesionales de la UNJFSC</strong>.
            </p>

            <p>
                Para completar tu registro y poder iniciar sesión, necesitas
                <strong>crear tu contraseña personal</strong> haciendo clic en el botón de abajo.
            </p>

            <!-- Botón principal -->
            <div class="cta-container">
                <a href="{{ $activationUrl }}" class="cta-button">
                    Activar mi cuenta y crear contraseña
                </a>
            </div>

            <!-- Nota de expiración -->
            <div class="expiry-note">
                <p>
                    ⏰ <strong>Este enlace expira el {{ $expiresAt }}.</strong>
                    Si no activas tu cuenta antes de esa fecha, contacta al administrador.
                </p>
            </div>

            <div class="divider"></div>

            <!-- URL alternativa -->
            <div class="url-fallback">
                <p>¿El botón no funciona? Copia y pega este enlace en tu navegador:</p>
                <a href="{{ $activationUrl }}">{{ $activationUrl }}</a>
            </div>

            <!-- Nota de seguridad -->
            <div class="security-note">
                <p>
                    🔒 <strong>Aviso de seguridad:</strong> Si no esperabas este correo y no has
                    solicitado una cuenta en este sistema, puedes ignorar este mensaje de forma segura.
                    Nadie podrá acceder a tu cuenta sin tu contraseña.
                </p>
            </div>
        </div>

        <!-- Pie de página -->
        <div class="footer">
            <p><strong>Sistema PPP — UNJFSC</strong></p>
            <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
            <p style="margin-top:8px;">© {{ date('Y') }} Universidad Nacional José Faustino Sánchez Carrión</p>
        </div>
    </div>
</body>
</html>
