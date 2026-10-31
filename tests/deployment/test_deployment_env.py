import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest

from scripts.deployment_env import dotenv_quote, production_values, validate_mail

try:
    import yaml
except ImportError:
    yaml = None


ROOT = Path(__file__).resolve().parents[2]
BASH = str(Path('C:/Program Files/Git/bin/bash.exe')) if os.name == 'nt' and Path('C:/Program Files/Git/bin/bash.exe').exists() else shutil.which('bash')


def sample_values():
    return {
        'APP_KEY': 'base64:test-key', 'APP_URL': 'https://example.test',
        'DB_DATABASE': 'test_database', 'DB_PASSWORD': 'dummy-database-password',
        'MAIL_HOST': 'smtp.example.test', 'MAIL_USERNAME': 'sender@example.test',
        'MAIL_PASSWORD': 'dummy-mail-password', 'MAIL_FROM_ADDRESS': 'sender@example.test',
    }


class ProductionEnvironmentTests(unittest.TestCase):
    @unittest.skipUnless(BASH, 'Bash required')
    def test_worker_executes_its_command_without_running_app_initialization(self):
        entrypoint = str(ROOT / 'docker/entrypoint.sh')
        subprocess.run([BASH, '-n', entrypoint], capture_output=True, check=True)
        result = subprocess.run([BASH, entrypoint, 'printf', 'worker-command-only'], capture_output=True, text=True, check=True)
        self.assertEqual(result.stdout, 'worker-command-only')

    @unittest.skipUnless(BASH and yaml, 'Bash and PyYAML required for workflow syntax validation')
    def test_workflow_shell_steps_are_valid_bash(self):
        workflow = yaml.safe_load((ROOT / '.github/workflows/deploy.yml').read_text(encoding='utf-8'))
        with tempfile.TemporaryDirectory() as directory:
            for job_name, job in workflow['jobs'].items():
                for index, step in enumerate(job['steps']):
                    if 'run' in step:
                        script = Path(directory) / f'{job_name}-{index}.sh'
                        script.write_text(step['run'], encoding='utf-8', newline='\n')
                        with self.subTest(step=step['name']):
                            subprocess.run([BASH, '-n', str(script)], capture_output=True, check=True)

    def test_missing_credentials_fail_without_disclosing_other_secrets(self):
        values = sample_values()
        del values['MAIL_USERNAME']
        with self.assertRaises(ValueError) as caught:
            production_values(values)
        self.assertIn('MAIL_USERNAME', str(caught.exception))
        self.assertNotIn(values['MAIL_PASSWORD'], str(caught.exception))

    def test_mail_configuration_defaults_to_smtp_and_database_queue(self):
        values = production_values(sample_values())
        self.assertEqual(values['MAIL_MAILER'], 'smtp')
        self.assertEqual(values['QUEUE_CONNECTION'], 'database')
        self.assertEqual(values['MAIL_PORT'], '587')
        self.assertEqual(values['MAIL_SCHEME'], 'smtp')
        self.assertEqual(values['MAIL_TIMEOUT'], '30')

    def test_bad_ports_schemes_and_sender_addresses_are_rejected(self):
        for name, value in [('MAIL_PORT', '0'), ('MAIL_PORT', '65536'), ('MAIL_PORT', 'abc'),
                            ('MAIL_SCHEME', 'tls'), ('MAIL_FROM_ADDRESS', 'not-an-email')]:
            with self.subTest(name=name, value=value), self.assertRaises(ValueError):
                validate_mail({**sample_values(), name: value})

    def test_multiline_credentials_cannot_inject_environment_entries(self):
        for suffix in ['\nAPP_DEBUG=true', '\r', '\x00']:
            with self.subTest(suffix=suffix), self.assertRaises(ValueError):
                production_values({**sample_values(), 'MAIL_PASSWORD': 'dummy' + suffix})

    def test_invalid_input_never_overwrites_a_previous_environment_file(self):
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / 'production.env'
            output.write_text('previous-file', encoding='utf-8')
            result = subprocess.run([sys.executable, str(ROOT / 'scripts/deployment_env.py'), '--output', str(output)],
                                    env={**os.environ, **sample_values(), 'MAIL_PASSWORD': ''}, capture_output=True, text=True)
            self.assertNotEqual(result.returncode, 0)
            self.assertEqual(output.read_text(encoding='utf-8'), 'previous-file')
            self.assertNotIn('dummy-mail-password', result.stderr + result.stdout)

    @unittest.skipUnless(shutil.which('php') and (ROOT / 'vendor/autoload.php').exists(), 'PHP dependencies required')
    def test_special_characters_round_trip_through_laravel_dotenv(self):
        value = "a'quote\" # hash \\ slash $literal ${UNDEFINED} end "
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / 'values.env'
            output.write_text('PROBE=' + dotenv_quote(value, 'PROBE') + '\n', encoding='utf-8')
            result = subprocess.run(['php', '-r',
                'require $argv[1]; echo json_encode(Dotenv\\Dotenv::parse(file_get_contents($argv[2])), JSON_THROW_ON_ERROR);',
                str(ROOT / 'vendor/autoload.php'), str(output)], capture_output=True, text=True, check=True)
            self.assertEqual(json.loads(result.stdout)['PROBE'], value)

    @unittest.skipUnless(shutil.which('docker'), 'Docker Compose CLI required; no daemon or deployment used')
    def test_compose_loads_mail_and_worker_without_changing_credentials(self):
        original = {**sample_values(), 'MAIL_PASSWORD': "a'quote\" # \\ $value ${UNDEFINED}"}
        values = production_values(original)
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / '.env'
            output.write_text(''.join(f'{key}={dotenv_quote(value, key)}\n' for key, value in values.items()), encoding='utf-8')
            command = ['docker', 'compose', '--project-directory', directory, '--env-file', str(output),
                       '-f', str(ROOT / 'docker-compose.prod.yml'), 'config']
            result = subprocess.run(command + ['--environment'], capture_output=True, text=True, check=True)
            resolved = dict(line.split('=', 1) for line in result.stdout.splitlines() if '=' in line)
            self.assertEqual(resolved['MAIL_PASSWORD'], original['MAIL_PASSWORD'])
            result = subprocess.run(command + ['--format', 'json'], capture_output=True, text=True, check=True)
            services = json.loads(result.stdout)['services']
            self.assertEqual(services['app']['environment']['MAIL_MAILER'], 'smtp')
            self.assertEqual(services['queue']['environment']['MAIL_MAILER'], 'smtp')
            self.assertEqual(services['queue']['command'][:4], ['php', 'artisan', 'queue:work', 'database'])
            self.assertEqual(services['queue']['depends_on']['app']['condition'], 'service_healthy')
            self.assertEqual(services['queue']['restart'], 'unless-stopped')
            self.assertNotIn('ports', services['queue'])


if __name__ == '__main__':
    unittest.main()
