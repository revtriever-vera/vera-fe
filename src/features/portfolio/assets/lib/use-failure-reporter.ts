import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useToast, type ToastApi } from '@/app/providers/toast-provider';
import { portfolioErrorMessage } from '../../lib/portfolio-error-message';
import { classifyFailure, type SubmitFailure } from './submit-failure';

export interface FailureHandlers {
    readonly onQuantity?: (message: string) => void;
    readonly onClass?: (message: string) => void;
    readonly onDuplicate?: (positionId: string) => void;
    readonly onAlert: (message: string) => void;
}

function fieldHandler(failure: SubmitFailure, handlers: FailureHandlers): ((message: string) => void) | undefined {
    if (failure.kind === 'quantity') {
        return handlers.onQuantity;
    }
    return failure.kind === 'class' ? handlers.onClass : undefined;
}

function redirectTarget(failure: SubmitFailure, handlers: FailureHandlers): (() => void) | undefined {
    if (failure.kind !== 'duplicate' || failure.positionId === null || handlers.onDuplicate === undefined) {
        return undefined;
    }
    const positionId: string = failure.positionId;
    const redirect: (positionId: string) => void = handlers.onDuplicate;
    return (): void => {
        redirect(positionId);
    };
}

export function useFailureReporter(handlers: FailureHandlers, toastTitle: string): (error: Error) => void {
    const { t }: UseTranslationResponse<'portfolio', undefined> = useTranslation('portfolio');
    const toast: ToastApi = useToast();
    return (error: Error): void => {
        const failure: SubmitFailure = classifyFailure(error);
        const message: string = portfolioErrorMessage(t, error);
        const field: ((message: string) => void) | undefined = fieldHandler(failure, handlers);
        const redirect: (() => void) | undefined = redirectTarget(failure, handlers);
        if (field !== undefined) {
            field(message);
            return;
        }
        if (redirect !== undefined) {
            redirect();
            return;
        }
        if (failure.kind === 'toast' || failure.kind === 'duplicate') {
            toast.show({ tone: 'critical', title: toastTitle, detail: message });
            return;
        }
        handlers.onAlert(message);
    };
}
