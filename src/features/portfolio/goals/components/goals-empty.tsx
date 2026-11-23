import type { ReactElement } from 'react';
import { Flag } from 'lucide-react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useRole } from '@/app/providers/use-role';
import { EmptyState } from '@/shared/ui/empty-state';
import { GOAL_KIND } from '../types';
import { CreateGoalLink } from './create-goal-link';

export function GoalsEmpty({ filtered }: { readonly filtered: boolean }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioGoals', undefined> = useTranslation('portfolioGoals');
    const { canEdit } = useRole();
    const icon: ReactElement = <Flag className="size-6" />;
    if (filtered) {
        return <EmptyState icon={icon} title={t('empty.filteredTitle')} description={t('empty.filteredDescription')} />;
    }
    if (!canEdit) {
        return <EmptyState icon={icon} title={t('empty.title')} description={t('empty.viewerDescription')} />;
    }
    return (
        <EmptyState
            icon={icon}
            title={t('empty.title')}
            description={t('empty.description')}
            actions={
                <>
                    <CreateGoalLink kind={GOAL_KIND.emergencyReserve} label={t('create.reserve')} />
                    <CreateGoalLink kind={GOAL_KIND.other} label={t('create.other')} variant="secondary" />
                </>
            }
        />
    );
}
