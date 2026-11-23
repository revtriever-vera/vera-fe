import { ApiError } from '@/shared/lib/api/api-error';

/** Recusa da API (fora da company de sistema, ou instalação sem admin): repetir não muda a resposta. */
export function isPlatformRefusal(error: unknown): boolean {
    return error instanceof ApiError && (error.status === 403 || error.status === 404);
}
