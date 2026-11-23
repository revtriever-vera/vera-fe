import type { ReactElement } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useRole } from '@/app/providers/use-role';
import { Alert } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import { Modal } from '@/shared/ui/modal';
import { Skeleton } from '@/shared/ui/skeleton';
import { useGoals } from '../api/use-goals.query';
import { useCloseGoalModal, useGoalModalParam, type GoalModalParam } from '../lib/use-goal-modal-param';
import { GOAL_KIND, type GoalKind, type GoalsList, type GoalView } from '../types';
import { GoalFormModal } from './goal-form-modal';

function PendingModal({ failed, onClose }: { readonly failed: boolean; readonly onClose: () => void }): ReactElement {
    const { t }: UseTranslationResponse<'portfolioGoals', undefined> = useTranslation('portfolioGoals');
    return (
        <Modal
            title={t('form.createTitle')}
            onClose={onClose}
            footer={
                <Button variant="ghost" onClick={onClose}>
                    {t('form.cancel')}
                </Button>
            }
        >
            {failed ? <Alert title={t('form.loadFailed')} /> : <Skeleton className="h-40 w-full" />}
        </Modal>
    );
}

function kindOf(param: GoalModalParam, goal: GoalView | undefined): GoalKind {
    return goal?.kind ?? param.create ?? GOAL_KIND.other;
}

function GoalModalLoader({ param, onClose }: { readonly param: GoalModalParam; readonly onClose: () => void }): ReactElement {
    const goals: UseQueryResult<GoalsList> = useGoals();
    const items: readonly GoalView[] | undefined = goals.data?.items;
    const goal: GoalView | undefined = items?.find((item: GoalView): boolean => item.id === param.edit);
    if (items === undefined) {
        return <PendingModal failed={goals.isError} onClose={onClose} />;
    }
    if (param.edit !== undefined && goal === undefined) {
        return <PendingModal failed onClose={onClose} />;
    }
    return <GoalFormModal key={goal?.id ?? param.create} goal={goal ?? null} kind={kindOf(param, goal)} goals={items} onClose={onClose} />;
}

export function GoalModalHost(): ReactElement | null {
    const param: GoalModalParam = useGoalModalParam();
    const { canEdit } = useRole();
    const close: () => void = useCloseGoalModal();
    if (!canEdit || (param.create === undefined && param.edit === undefined)) {
        return null;
    }
    return <GoalModalLoader param={param} onClose={close} />;
}
