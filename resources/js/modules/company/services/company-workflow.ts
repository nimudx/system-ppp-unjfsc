export type CompanyData = {
    id?: number;
    ruc: string;
    name: string;
    razon?: string | null;
    address: string | null;
    phone: string | null;
    email: string | null;
};
export type RequestState =
    | 'pending_review'
    | 'observed'
    | 'rejected'
    | 'awaiting_company'
    | 'accepted'
    | 'declined';
export const stateLabels: Record<RequestState, string> = {
    pending_review: 'Pendiente de revisión del titular',
    observed: 'Observada por el titular',
    rejected: 'Rechazada por el titular',
    awaiting_company: 'Esperando respuesta de la empresa',
    accepted: 'Estudiante aceptado por la empresa',
    declined: 'Estudiante rechazado por la empresa',
};
export type CompanyRequest = {
    id: number;
    ruc: string;
    state: RequestState;
    company_id: number | null;
    company: CompanyData | null;
    company_data: CompanyData;
    student: {
        id: number;
        name: string;
        school: string;
        semester: string | null;
    };
    review_comment: string | null;
    company_comment: string | null;
    can_resubmit: boolean;
    can_register_practice: boolean;
    can_upload_documents: boolean;
    placement_id: number | null;
    internship_id: number | null;
    ruc_document_url: string | null;
    last_invited_at: string | null;
    declaration: { text: string; version: string; accepted_at: string };
    history: {
        id: number;
        action: string;
        to_state: RequestState;
        comment: string | null;
        created_at: string;
    }[];
};
export type Lookup = {
    found: boolean;
    next_action: 'send_request' | 'send_confirmation';
    company: CompanyData | null;
    declaration: { text: string; version: string };
};
export type Invitation = {
    company: CompanyData;
    student: { name: string; school: string };
    terms: { text: string; version: string };
    requires_activation: boolean;
    expires_at: string;
};
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
export const workflow = {
    lookup: (ruc: string) =>
        workflowApi<Lookup>(
            `/api/company-validation/companies/${encodeURIComponent(ruc)}`,
        ),
    current: (signal?: AbortSignal) =>
        workflowApi<{ data: CompanyRequest | null }>(
            '/api/company-validation/current',
            'GET',
            undefined,
            signal,
        ),
    show: (id: number) =>
        workflowApi<{ data: CompanyRequest }>(
            `/api/company-validation/requests/${id}`,
        ),
    submit: (data: FormData, id?: number) => {
        if (id) data.set('_method', 'PATCH');
        return workflowApi<{ data: CompanyRequest }>(
            `/api/company-validation/requests${id ? `/${id}` : ''}`,
            'POST',
            data,
        );
    },
    list: (query: string, signal?: AbortSignal) =>
        workflowApi<{
            data: CompanyRequest[];
            meta: { current_page: number; last_page: number };
        }>(
            `/api/company-validation/requests?${query}`,
            'GET',
            undefined,
            signal,
        ),
    review: (id: number, decision: string, comment: string) =>
        workflowApi<{ data: CompanyRequest }>(
            `/api/company-validation/requests/${id}/review`,
            'PATCH',
            { decision, comment },
        ),
    resend: (id: number) =>
        workflowApi<{ data: CompanyRequest }>(
            `/api/company-validation/requests/${id}/resend`,
            'POST',
        ),
    decide: (id: number, decision: string, comment: string) =>
        workflowApi<{ data: CompanyRequest }>(
            `/api/company-validation/requests/${id}/decision`,
            'PATCH',
            { decision, comment },
        ),
    placement: (data: object) =>
        workflowApi<{ internship_id: number; can_upload_documents: boolean }>(
            '/api/company-validation/placement',
            'POST',
            data,
        ),
    invitation: (token: string, signal?: AbortSignal) =>
        workflowApi<{ data: Invitation }>(
            `/api/company-invitations/${encodeURIComponent(token)}`,
            'GET',
            undefined,
            signal,
        ),
    activate: (token: string, data: object) =>
        workflowApi<{ next_url: string }>(
            `/api/company-invitations/${encodeURIComponent(token)}/activate`,
            'POST',
            data,
        ),
};
