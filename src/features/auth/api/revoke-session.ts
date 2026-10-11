import { apiClient } from '@/shared/lib/api/client';

export async function revokeSession(): Promise<void> {
    await apiClient.POST('/auth/logout').catch((): undefined => undefined);
}
