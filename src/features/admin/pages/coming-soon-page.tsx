import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { EmptyState } from '@/shared/ui/empty-state';

export function ComingSoonPage(): ReactElement {
    const { t }: UseTranslationResponse<'admin', undefined> = useTranslation('admin');
    return (
        <section className="flex flex-col gap-4 px-page-x py-6">
            <h1 className="text-2xl font-extrabold tracking-tight">{t('accountsTitle')}</h1>
            <EmptyState title={t('soonTitle')} description={t('accountsSoon')} />
        </section>
    );
}
