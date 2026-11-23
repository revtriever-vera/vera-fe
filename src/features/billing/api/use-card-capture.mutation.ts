import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { CardCaptureSession } from '../types';

export function useCardCapture(): UseMutationResult<CardCaptureSession, Error, void> {
    return useMutation({
        mutationFn: async (): Promise<CardCaptureSession> =>
            unwrap<CardCaptureSession>(await apiClient.POST('/billing/payment-method/capture-session'))
    });
}
