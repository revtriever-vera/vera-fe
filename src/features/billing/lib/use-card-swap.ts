import { useState } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useToast, type ToastApi } from '@/app/providers/toast-provider';
import { useCardCapture } from '../api/use-card-capture.mutation';
import type { CardCaptureSession } from '../types';
import { billingErrorMessage } from './billing-error-message';

export interface CardSwap {
    readonly url: string | null;
    readonly start: () => void;
    readonly pending: boolean;
    readonly close: () => void;
}

export function useCardSwap(): CardSwap {
    const { t }: UseTranslationResponse<'billing', undefined> = useTranslation('billing');
    const toast: ToastApi = useToast();
    const capture: UseMutationResult<CardCaptureSession, Error, void> = useCardCapture();
    const [url, setUrl] = useState<string | null>(null);
    return {
        url,
        pending: capture.isPending,
        close: (): void => {
            setUrl(null);
        },
        start: (): void => {
            capture.mutate(undefined, {
                onSuccess: (session: CardCaptureSession): void => {
                    setUrl(session.captureUrl);
                },
                onError: (error: Error): void => {
                    toast.show({ tone: 'critical', title: billingErrorMessage(t, error) });
                }
            });
        }
    };
}
