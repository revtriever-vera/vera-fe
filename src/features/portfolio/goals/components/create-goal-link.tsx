import type { ReactElement } from 'react';
import { Link } from '@tanstack/react-router';
import { Plus } from 'lucide-react';
import { buttonVariants } from '@/shared/ui/button';
import type { GoalCreateKind } from '../types';

export interface CreateGoalLinkProps {
    readonly kind: GoalCreateKind;
    readonly label: string;
    readonly variant?: 'primary' | 'secondary';
    readonly withIcon?: boolean;
}

export function CreateGoalLink({ kind, label, variant = 'primary', withIcon = false }: CreateGoalLinkProps): ReactElement {
    return (
        <Link
            to="/portfolio/goals"
            search={(previous: Record<string, unknown>): Record<string, unknown> => ({ ...previous, create: kind })}
            className={buttonVariants({ variant })}
        >
            {withIcon ? <Plus aria-hidden="true" className="size-4" /> : null}
            {label}
        </Link>
    );
}
