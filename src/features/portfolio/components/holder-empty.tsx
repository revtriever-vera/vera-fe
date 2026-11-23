import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { EmptyState } from '@/shared/ui/empty-state';
import { HOLDER_ALL, personName } from '../lib/holder-filter';
import { usePeople, type PeopleState } from '../lib/people-context';

export function HolderEmpty({ holder }: { readonly holder: string }): ReactElement {
    const { t }: UseTranslationResponse<'portfolio', undefined> = useTranslation('portfolio');
    const { people }: PeopleState = usePeople();
    const name: string = holder === HOLDER_ALL ? t('holder.all') : personName(people, holder);
    return <EmptyState title={t('holder.emptyTitle', { holder: name })} description={t('holder.emptyDescription')} />;
}
