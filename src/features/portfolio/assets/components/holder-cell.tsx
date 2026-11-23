import { Loader2 } from 'lucide-react';
import type { ReactElement } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useToast, type ToastApi } from '@/app/providers/toast-provider';
import { useRole } from '@/app/providers/use-role';
import { track } from '@/shared/lib/analytics';
import type { ApiError } from '@/shared/lib/api/api-error';
import { HolderSelect } from '../../components/holder-select';
import { HOLDER_ALL, holderValueOf, personName } from '../../lib/holder-filter';
import { usePeople, type PeopleState } from '../../lib/people-context';
import { portfolioErrorMessage } from '../../lib/portfolio-error-message';
import type { HoldingView } from '../../types';
import { useSetHolder, type SetHolderInput } from '../api/use-set-holder.mutation';

export interface HolderCellProps {
    readonly holding: HoldingView;
}

function useHolderChange(holding: HoldingView): { readonly pending: boolean; readonly change: (value: string) => void } {
    const { t }: UseTranslationResponse<'portfolio', undefined> = useTranslation('portfolio');
    const toast: ToastApi = useToast();
    const { people }: PeopleState = usePeople();
    const mutation: UseMutationResult<void, ApiError, SetHolderInput> = useSetHolder();
    const current: string = holderValueOf(holding.holder?.userId);
    const change = (value: string): void => {
        if (value === current) {
            return;
        }
        mutation.mutate(
            { kind: holding.kind, id: holding.id, holderUserId: value === HOLDER_ALL ? null : value },
            {
                onSuccess: (): void => {
                    track('holder_set', { kind: value === HOLDER_ALL ? 'all' : 'person', source: 'inline' });
                    const holder: string = value === HOLDER_ALL ? t('holder.all') : personName(people, value);
                    toast.show({ tone: 'positive', title: t('holder.changed', { symbol: holding.symbol, holder }) });
                },
                onError: (error: Error): void => {
                    toast.show({ tone: 'critical', title: t('holder.changeFailed'), detail: portfolioErrorMessage(t, error) });
                }
            }
        );
    };
    return { pending: mutation.isPending, change };
}

function EditableHolder({ holding }: HolderCellProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolio', undefined> = useTranslation('portfolio');
    const { pending, change } = useHolderChange(holding);
    return (
        <div aria-busy={pending}>
            <HolderSelect
                value={holderValueOf(holding.holder?.userId)}
                label={t('holder.cell', { symbol: holding.symbol })}
                disabled={pending}
                leading={pending ? <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" /> : undefined}
                onChange={change}
            />
        </div>
    );
}

export function HolderCell({ holding }: HolderCellProps): ReactElement | null {
    const { t }: UseTranslationResponse<'portfolio', undefined> = useTranslation('portfolio');
    const { canEdit } = useRole();
    const { multi }: PeopleState = usePeople();
    if (!multi) {
        return null;
    }
    if (canEdit) {
        return <EditableHolder holding={holding} />;
    }
    return <span className="text-sm text-content">{holding.holder?.name ?? t('holder.all')}</span>;
}
