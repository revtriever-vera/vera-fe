import type { ReactElement, ReactNode } from 'react';
import { Info, type LucideIcon } from 'lucide-react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { WORK_STEP_COUNT } from '../lib/onboarding-progress';
import { StepHeading } from './step-heading';
import { WhyList, type WhyItem } from './why-list';

export interface StepLayoutProps {
    readonly current: number;
    readonly title: string;
    readonly lead: string;
    readonly why: readonly WhyItem[];
    readonly noteIcon?: LucideIcon;
    readonly noteTitle: string;
    readonly noteText: string;
    readonly children: ReactNode;
}

export function StepLayout({
    current,
    title,
    lead,
    why,
    noteIcon: NoteIcon = Info,
    noteTitle,
    noteText,
    children
}: StepLayoutProps): ReactElement {
    const { t }: UseTranslationResponse<'onboarding', undefined> = useTranslation('onboarding');

    return (
        <div className="mt-3 grid w-[min(1100px,100%)] items-start gap-8 min-[861px]:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
            <div>
                <span className="text-xs font-bold tracking-[0.07em] text-accent-strong uppercase">
                    {t('stepEyebrow', { current, total: WORK_STEP_COUNT })}
                </span>
                <StepHeading>{title}</StepHeading>
                <p className="max-w-[54ch] text-base leading-relaxed text-content-muted">{lead}</p>
                <WhyList items={why} />
                <p className="mt-5 flex max-w-[54ch] items-start gap-2.5 rounded-control border border-border bg-surface-muted p-3 text-[13.5px] leading-relaxed text-content-muted">
                    <NoteIcon className="mt-0.5 size-4 shrink-0 text-accent-strong" aria-hidden="true" />
                    <span>
                        <b className="text-content">{noteTitle}</b> {noteText}
                    </span>
                </p>
            </div>
            {children}
        </div>
    );
}
