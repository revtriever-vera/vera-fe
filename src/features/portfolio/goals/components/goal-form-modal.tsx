import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Button } from '@/shared/ui/button';
import { Modal } from '@/shared/ui/modal';
import { useGoalForm, type GoalFormState } from '../lib/use-goal-form';
import type { GoalKind, GoalView } from '../types';
import { GOAL_FORM_ID, GoalForm } from './goal-form';

export interface GoalFormModalProps {
    readonly goal: GoalView | null;
    readonly kind: GoalKind;
    readonly goals: readonly GoalView[];
    readonly onClose: () => void;
}

function FormFooter({
    state,
    editing,
    onClose
}: {
    readonly state: GoalFormState;
    readonly editing: boolean;
    readonly onClose: () => void;
}): ReactElement {
    const { t }: UseTranslationResponse<'portfolioGoals', undefined> = useTranslation('portfolioGoals');
    const idle: string = editing ? t('form.save') : t('form.create');
    return (
        <>
            <Button variant="ghost" onClick={onClose}>
                {t('form.cancel')}
            </Button>
            <Button type="submit" form={GOAL_FORM_ID} loading={state.busy}>
                {state.busy ? t('form.saving') : idle}
            </Button>
        </>
    );
}

export function GoalFormModal({ goal, kind, goals, onClose }: GoalFormModalProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioGoals', undefined> = useTranslation('portfolioGoals');
    const state: GoalFormState = useGoalForm({ goal, kind, goals, initialName: t(`form.models.${kind}.name`), onSaved: onClose });
    return (
        <Modal
            title={goal === null ? t('form.createTitle') : t('form.editTitle', { name: goal.name })}
            description={t('form.description')}
            fullOnMobile
            onClose={onClose}
            footer={<FormFooter state={state} editing={goal !== null} onClose={onClose} />}
        >
            <GoalForm state={state} goal={goal} />
        </Modal>
    );
}
