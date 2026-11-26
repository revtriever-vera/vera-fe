import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useRole } from '@/app/providers/use-role';
import { useAssistantSlots } from '../lib/use-assistant-slots';
import type { ImportCorrections } from '../lib/assistant-slots';
import { ActionButtons } from './assistant-action-buttons';

export interface ImportOpenState {
    readonly busy: boolean;
    readonly confirming: boolean;
    readonly importPreview: Readonly<Record<string, unknown>> | null;
    readonly confirmImport: (corrections: ImportCorrections) => void;
    readonly cancel: () => void;
}

export function ImportOpenBody({ state }: { readonly state: ImportOpenState }): ReactElement {
    const { t }: UseTranslationResponse<'assistant', undefined> = useTranslation('assistant');
    const { canEdit }: { canEdit: boolean } = useRole();
    const { ImportReview } = useAssistantSlots();
    if (state.importPreview === null) {
        return <p className="m-0 text-content-muted">{t('action.importExpired')}</p>;
    }
    if (!canEdit) {
        return <p className="m-0 text-xs text-content-subtle">{t('action.readOnly')}</p>;
    }
    return (
        <ImportReview
            preview={state.importPreview}
            renderActions={(corrections: ImportCorrections | null): ReactElement => (
                <ActionButtons
                    confirmPending={state.confirming}
                    busy={state.busy}
                    canConfirm={corrections !== null}
                    onConfirm={(): void => {
                        if (corrections !== null) {
                            state.confirmImport(corrections);
                        }
                    }}
                    onCancel={state.cancel}
                />
            )}
        />
    );
}
