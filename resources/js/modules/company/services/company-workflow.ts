import internship from '@/routes/academic/internship';

export type VerifiedCompany = {
    id: number;
    ruc: string;
    name: string;
    address: string | null;
    phone: string | null;
    email: string | null;
};

type VerificationResponse = {
    found: boolean;
    company: VerifiedCompany | null;
    areas: { id: number; name: string }[];
    error?: string;
    message?: string;
};

function isVerificationResponse(value: unknown): value is VerificationResponse {
    if (typeof value !== 'object' || value === null) return false;
    const result = value as Record<string, unknown>;

    return (
        typeof result.found === 'boolean' &&
        Array.isArray(result.areas) &&
        (result.found
            ? typeof result.company === 'object' &&
              result.company !== null &&
              typeof (result.company as Record<string, unknown>).id ===
                  'number' &&
              typeof (result.company as Record<string, unknown>).ruc ===
                  'string' &&
              typeof (result.company as Record<string, unknown>).name ===
                  'string'
            : result.company === null)
    );
}

export async function verifyCompanyByRuc(
    ruc: string,
): Promise<VerificationResponse> {
    const response = await fetch(internship.api.company.verify.url(ruc), {
        headers: { Accept: 'application/json' },
    });
    const body: unknown = await response.json();

    const serverMessage =
        typeof body === 'object' && body !== null
            ? ((body as Record<string, unknown>).error ??
              (body as Record<string, unknown>).message)
            : null;
    if (!response.ok || typeof serverMessage === 'string') {
        throw new Error(
            typeof serverMessage === 'string'
                ? serverMessage
                : 'No se pudo consultar el RUC. Intenta nuevamente.',
        );
    }

    if (!isVerificationResponse(body)) {
        throw new Error(
            'El servidor devolvió una respuesta de consulta inválida.',
        );
    }

    return body;
}
