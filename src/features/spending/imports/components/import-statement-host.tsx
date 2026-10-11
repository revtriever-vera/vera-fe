import type { ReactElement } from 'react';
import { useNavigate, useSearch, type UseNavigateResult } from '@tanstack/react-router';
import { ImportStatementModal } from './import-statement-modal';

export function ImportStatementHost(): ReactElement | null {
    const search: { import?: boolean } = useSearch({ strict: false });
    const navigate: UseNavigateResult<string> = useNavigate();
    if (search.import !== true) {
        return null;
    }
    const close = (): void => {
        void navigate({
            to: '.',
            search: (previous: Record<string, unknown>): Record<string, unknown> => ({ ...previous, import: undefined }),
            replace: true
        });
    };
    return <ImportStatementModal onClose={close} />;
}
