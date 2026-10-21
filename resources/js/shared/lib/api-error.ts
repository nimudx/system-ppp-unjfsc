import axios from 'axios';
export interface ApiErrorBody {
    message?: string;
    errors?: Record<string, string[]>;
}
export function apiErrorBody(error: unknown): ApiErrorBody {
    if (axios.isAxiosError<ApiErrorBody>(error))
        return error.response?.data ?? {};
    return { message: error instanceof Error ? error.message : undefined };
}
