export class WorkflowError extends Error {
    constructor(
        message: string,
        public status: number,
        public errors: Record<string, string[]> = {},
    ) {
        super(message);
    }
}

// Laravel web routes use the existing session and CSRF protection.
export async function workflowApi<T>(
    url: string,
    method = 'GET',
    data?: object | FormData,
    signal?: AbortSignal,
): Promise<T> {
    const headers = new Headers({
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    });
    if (method !== 'GET') {
        const cookie = document.cookie
            .split('; ')
            .find((part) => part.startsWith('XSRF-TOKEN='));
        if (cookie)
            headers.set(
                'X-XSRF-TOKEN',
                decodeURIComponent(cookie.slice('XSRF-TOKEN='.length)),
            );
        else {
            const token = document.querySelector<HTMLMetaElement>(
                'meta[name="csrf-token"]',
            )?.content;
            if (token) headers.set('X-CSRF-TOKEN', token);
        }
    }
    const multipart = data instanceof FormData;
    if (data && !multipart) headers.set('Content-Type', 'application/json');
    const response = await fetch(url, {
        method,
        headers,
        credentials: 'same-origin',
        signal,
        body: data ? (multipart ? data : JSON.stringify(data)) : undefined,
    });
    const body = await response.json().catch(() => null);
    if (!response.ok) {
        const errors = body?.errors ?? {};
        const first = Object.values(errors).flat()[0];
        const fallback =
            response.status === 419
                ? 'Tu sesión venció. Recarga la página e inténtalo nuevamente.'
                : response.status === 401
                  ? 'Inicia sesión para continuar.'
                  : 'No se pudo completar la operación.';
        throw new WorkflowError(
            typeof first === 'string' ? first : body?.message || fallback,
            response.status,
            errors,
        );
    }
    return body as T;
}
