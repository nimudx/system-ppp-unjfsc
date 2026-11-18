import { activate, show as showInvitation } from '@/routes/company-invitations';
import { current } from '@/routes/company-validation';
import { lookup } from '@/routes/company-validation/companies';
import requests from '@/routes/company-validation/requests';
import { WorkflowError, workflowApi } from '@/shared/lib/workflow-api';

export { WorkflowError, workflowApi };

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
export const workflow = {
    lookup: (ruc: string) =>
        workflowApi<Lookup>(lookup(encodeURIComponent(ruc)).url),
    current: (signal?: AbortSignal) =>
        workflowApi<{ data: CompanyRequest | null }>(
            current.url(),
            'GET',
            undefined,
            signal,
        ),
    show: (id: number) =>
        workflowApi<{ data: CompanyRequest }>(requests.show(id).url),
    submit: (data: FormData, id?: number) => {
        if (id) data.set('_method', 'PATCH');
        return workflowApi<{ data: CompanyRequest }>(
            id ? requests.resubmit(id).url : requests.store().url,
            'POST',
            data,
        );
    },
    list: (query: string, signal?: AbortSignal) =>
        workflowApi<{
            data: CompanyRequest[];
            meta: { current_page: number; last_page: number };
        }>(
            `${requests.index().url}${query ? `?${query}` : ''}`,
            'GET',
            undefined,
            signal,
        ),
    review: (id: number, decision: string, comment: string) =>
        workflowApi<{ data: CompanyRequest }>(
            requests.review(id).url,
            'PATCH',
            {
                decision,
                comment,
            },
        ),
    resend: (id: number) =>
        workflowApi<{ data: CompanyRequest }>(requests.resend(id).url, 'POST'),
    decide: (id: number, decision: string, comment: string) =>
        workflowApi<{ data: CompanyRequest }>(
            requests.decision(id).url,
            'PATCH',
            { decision, comment },
        ),
    invitation: (token: string, signal?: AbortSignal) =>
        workflowApi<{ data: Invitation }>(
            showInvitation(encodeURIComponent(token)).url,
            'GET',
            undefined,
            signal,
        ),
    activate: (token: string, data: object) =>
        workflowApi<{ next_url: string }>(
            activate(encodeURIComponent(token)).url,
            'POST',
            data,
        ),
};
