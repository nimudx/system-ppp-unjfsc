/**
 * Normaliza el tipo de práctica.
 *
 * Los registros antiguos guardan el tipo en español ('desarrollo',
 * 'convalidacion'), pero la API solo acepta los valores en inglés.
 */
export function normalizeInternshipType(type: string): string {
    if (type === 'desarrollo') return 'development';
    if (type === 'convalidacion') return 'validation';

    return type;
}
