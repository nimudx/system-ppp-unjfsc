"""Build Laravel/Compose dotenv files from Actions environment, without logging secrets."""

import argparse
import os
from pathlib import Path
import re
import sys


def require(values, names):
    missing = [name for name in names if not values.get(name, '').strip()]
    if missing:
        raise ValueError('Falta configurar en GitHub: ' + ', '.join(missing))


def validate_mail(values):
    require(values, ['MAIL_HOST', 'MAIL_USERNAME', 'MAIL_PASSWORD', 'MAIL_FROM_ADDRESS'])
    port = values.get('MAIL_PORT', '587')
    if not port.isdigit() or not 1 <= int(port) <= 65535:
        raise ValueError('MAIL_PORT debe ser un puerto válido.')
    if values.get('MAIL_SCHEME', 'smtp') not in ('smtp', 'smtps'):
        raise ValueError('MAIL_SCHEME debe ser smtp (STARTTLS) o smtps (TLS implícito).')
    if not re.fullmatch(r'[^\s@]+@[^\s@]+\.[^\s@]+', values['MAIL_FROM_ADDRESS']):
        raise ValueError('MAIL_FROM_ADDRESS debe ser un correo válido.')
    for name, value in values.items():
        if name.startswith('MAIL_'):
            dotenv_quote(value, name)


def dotenv_quote(value, name):
    # Both Docker Compose and phpdotenv accept these double-quoted escapes.
    # Refuse multiline values rather than creating a second environment entry.
    if any(character in value for character in ('\r', '\n', '\x00')):
        raise ValueError(f'{name} debe contener una sola línea.')
    return '"' + value.replace('\\', '\\\\').replace('"', '\\"').replace('$', '\\$') + '"'


def production_values(source):
    validate_mail(source)
    require(source, ['APP_KEY', 'APP_URL', 'DB_DATABASE', 'DB_PASSWORD'])
    return {
        'APP_NAME': 'Sistema PPP UNJFSC',
        'APP_ENV': 'production', 'APP_KEY': source['APP_KEY'],
        'APP_DEBUG': 'false', 'APP_URL': source['APP_URL'],
        'LOG_CHANNEL': 'stack', 'LOG_LEVEL': 'error',
        'DB_CONNECTION': 'mysql', 'DB_HOST': 'db', 'DB_PORT': '3306',
        'DB_DATABASE': source['DB_DATABASE'], 'DB_USERNAME': 'root',
        'DB_PASSWORD': source['DB_PASSWORD'],
        'SESSION_DRIVER': 'database', 'QUEUE_CONNECTION': 'database',
        'CACHE_STORE': 'database', 'FILESYSTEM_DISK': 'local',
        'MAIL_MAILER': 'smtp', 'MAIL_HOST': source['MAIL_HOST'],
        'MAIL_PORT': source.get('MAIL_PORT', '587'),
        'MAIL_SCHEME': source.get('MAIL_SCHEME', 'smtp'),
        'MAIL_USERNAME': source['MAIL_USERNAME'], 'MAIL_PASSWORD': source['MAIL_PASSWORD'],
        'MAIL_FROM_ADDRESS': source['MAIL_FROM_ADDRESS'],
        'MAIL_FROM_NAME': source.get('MAIL_FROM_NAME', 'Sistema de Prácticas UNJFSC'),
        'MAIL_TIMEOUT': '30', 'VITE_APP_NAME': 'Sistema PPP UNJFSC',
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument('--check-mail', action='store_true')
    mode.add_argument('--output', type=Path)
    args = parser.parse_args()
    try:
        if args.check_mail:
            validate_mail(os.environ)
            print('Configuración de correo presente. No se enviaron mensajes.')
            return 0
        values = production_values(os.environ)
        content = ''.join(f'{name}={dotenv_quote(value, name)}\n' for name, value in values.items())
        # Runner temp file only. The workflow transfers it over SSH and removes it.
        descriptor = os.open(args.output, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
        with os.fdopen(descriptor, 'w', encoding='utf-8', newline='\n') as output:
            output.write(content)
        print('Archivo de producción preparado; valores ocultos.')
        return 0
    except ValueError as error:
        print(f'::error::{error}', file=sys.stderr)
        return 1


if __name__ == '__main__':
    sys.exit(main())
