import axios from 'axios';
import register from '@/routes/register';

export interface ServiceOptions {
    onSuccess?: (response: any) => void;
    onError?: (error: any) => void;
}

export const personService = {
    stepOne: (payload: any) => axios.post(register.stepOne().url, payload),
    stepTwo: (payload: any) => axios.post(register.stepTwo().url, payload),
    store: (payload: any, options?: ServiceOptions) => {
        return axios.post(register.academic().url, payload)
            .then(res => {
                options?.onSuccess?.(res);
                return res;
            })
            .catch(err => {
                options?.onError?.(err);
                throw err;
            });
    },
    storeMassive: (payload: any) => axios.post(register.academic.massive().url, payload)
}