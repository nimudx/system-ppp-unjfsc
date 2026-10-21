import axios from 'axios';
import type { AxiosResponse } from 'axios';
import type {
    RegistrationLookupResponse,
    RegistrationReport,
    CsvRow,
} from '@/modules/registration/types';
import register from '@/routes/register';

export interface ServiceOptions {
    onSuccess?: (response: AxiosResponse<unknown>) => void;
    onError?: (error: unknown) => void;
}
type AcademicRegistration = {
    email: string;
    role_id: string;
    section_id: string;
    user_id: number | null;
    type_user_id: number;
    person: { id: number | null; dni: string; names: string; surnames: string };
};
export const personService = {
    stepOne: (payload: {
        email: string;
        role_id: string;
        section_id?: string;
    }) =>
        axios.post<RegistrationLookupResponse>(register.stepOne().url, payload),
    stepTwo: (payload: { dni: string }) =>
        axios.post<RegistrationLookupResponse>(register.stepTwo().url, payload),
    store: (payload: AcademicRegistration, options?: ServiceOptions) =>
        axios
            .post<unknown>(register.academic().url, payload)
            .then((res) => {
                options?.onSuccess?.(res);
                return res;
            })
            .catch((error: unknown) => {
                if (options?.onError) {
                    options.onError(error);
                    return;
                }
                throw error;
            }),
    storeMassive: (payload: {
        role_id: string;
        section_id: string;
        rows: CsvRow[];
    }) =>
        axios.post<{ message: string; data: RegistrationReport }>(
            register.academic.massive().url,
            payload,
        ),
};
