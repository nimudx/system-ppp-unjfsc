<!doctype html>
<html lang="es"><head><meta charset="utf-8"><title>Invitación UNJFSC</title></head>
<body>
<h1>Universidad Nacional José Faustino Sánchez Carrión</h1>
<p>Estimada empresa {{ $details['company_name'] }} (RUC {{ $details['ruc'] }}):</p>
<p>La universidad le invita a participar en el proceso de prácticas preprofesionales.</p>
<p>El estudiante <strong>{{ $details['student_name'] }}</strong>, de la escuela {{ $details['school'] }}, ha solicitado su confirmación como practicante.</p>
@if($details['requires_activation'])
<p>Active la cuenta de su empresa y luego acepte o rechace la solicitud del estudiante. El enlace de activación es personal, de un solo uso y vence en {{ $details['expires_hours'] }} horas.</p>
@else
<p>Ingrese con su cuenta de empresa para aceptar o rechazar la solicitud del estudiante.</p>
@endif
<p><a href="{{ $details['url'] }}">{{ $details['requires_activation'] ? 'Activar cuenta de empresa' : 'Revisar solicitud del estudiante' }}</a></p>
<p>La activación de la cuenta no acepta automáticamente al estudiante.</p>
</body></html>
