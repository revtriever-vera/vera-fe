import type { ReactElement } from 'react';
import { ApiError } from '@/shared/lib/api/api-error';
import { Alert } from './alert';

export interface FailureAlertProps {
    readonly error: Error | null;
    readonly title: string;
}

export function FailureAlert({ error, title }: FailureAlertProps): ReactElement | null {
    if (!error) {
        return null;
    }
    if (error instanceof ApiError) {
        return <Alert title={title} detail={error.problem.detail} requestId={supportId(error)} />;
    }
    return <Alert title={title} detail={error.message} />;
}

function supportId(error: ApiError): string | null {
    return error.status >= 500 ? error.requestId : null;
}
