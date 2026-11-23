import type { ReactElement } from 'react';
import { Link } from '@tanstack/react-router';
import { Pencil } from 'lucide-react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useRole } from '@/app/providers/use-role';
import { buttonVariants } from '@/shared/ui/button';

export function EditGoalLink({ goalId, name }: { readonly goalId: string; readonly name: string }): ReactElement | null {
    const { t }: UseTranslationResponse<'portfolioGoals', undefined> = useTranslation('portfolioGoals');
    const { canEdit } = useRole();
    if (!canEdit) {
        return null;
    }
    return (
        <Link
            to="/portfolio/goals"
            search={(previous: Record<string, unknown>): Record<string, unknown> => ({ ...previous, edit: goalId })}
            aria-label={t('card.edit', { name })}
            className={buttonVariants({ variant: 'ghost', size: 'sm' })}
        >
            <Pencil aria-hidden="true" className="size-4" />
            {t('card.editLabel')}
        </Link>
    );
}
