import { useEffect, useId, type ReactElement } from 'react';
import { ChevronDown, ChevronUp, KeyRound } from 'lucide-react';
import { Trans, useTranslation, type UseTranslationResponse } from 'react-i18next';
import { track } from '@/shared/lib/analytics';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { TUTORIAL_STEPS, type TutorialStepDefinition } from '../lib/tutorial-steps';
import { useTutorialProgress, type TutorialProgress } from '../lib/use-tutorial-progress';
import { PluggyLink, TutorialStep, tutorialStepId } from './tutorial-step';

export interface PluggyTutorialProps {
    readonly companyId: string;
    readonly expanded: boolean;
    readonly focusStep: number | null;
    readonly onExpandedChange: (expanded: boolean) => void;
}

function useFocusStep(expanded: boolean, focusStep: number | null): void {
    useEffect((): void => {
        if (!expanded || focusStep === null) {
            return;
        }
        const heading: HTMLElement | null | undefined = document.getElementById(tutorialStepId(focusStep))?.querySelector('h3');
        heading?.scrollIntoView({ block: 'center' });
        heading?.focus();
    }, [expanded, focusStep]);
}

function TutorialBody({ progress }: { readonly progress: TutorialProgress }): ReactElement {
    const toggle = (step: number): void => {
        if (progress.toggle(step)) {
            track('spending_tutorial_step_checked', { step });
        }
    };
    return (
        <>
            <ol className="flex list-decimal flex-col gap-5 pl-5">
                {TUTORIAL_STEPS.map((definition: TutorialStepDefinition): ReactElement => (
                    <TutorialStep
                        key={definition.step}
                        definition={definition}
                        done={progress.done.has(definition.step)}
                        onToggle={toggle}
                    />
                ))}
            </ol>
            <p className="text-sm text-content-muted">
                <Trans i18nKey="tutorial.reference" ns="spendingConnections" components={{ github: <PluggyLink target="github" /> }} />
            </p>
        </>
    );
}

export function PluggyTutorial({ companyId, expanded, focusStep, onExpandedChange }: PluggyTutorialProps): ReactElement {
    const { t }: UseTranslationResponse<'spendingConnections', undefined> = useTranslation('spendingConnections');
    const progress: TutorialProgress = useTutorialProgress(companyId);
    const bodyId: string = useId();
    const titleId: string = useId();
    useFocusStep(expanded, focusStep);
    return (
        <Card className="flex flex-col gap-4" aria-labelledby={titleId} role="region">
            <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex flex-col gap-1">
                    <h2 id={titleId} className="flex items-center gap-2 text-base font-semibold text-content">
                        <KeyRound className="size-4 text-accent-strong" aria-hidden="true" />
                        {t('tutorial.title')}
                    </h2>
                    <p className="text-sm text-content-muted">{t('tutorial.intro')}</p>
                </div>
                <Button
                    variant="secondary"
                    size="sm"
                    aria-expanded={expanded}
                    aria-controls={bodyId}
                    onClick={(): void => {
                        onExpandedChange(!expanded);
                    }}
                >
                    {expanded ? <ChevronUp className="size-4" aria-hidden="true" /> : <ChevronDown className="size-4" aria-hidden="true" />}
                    {expanded ? t('tutorial.hide') : t('tutorial.show')}
                </Button>
            </div>
            <div id={bodyId} hidden={!expanded} className="flex flex-col gap-4">
                {expanded ? <TutorialBody progress={progress} /> : null}
            </div>
        </Card>
    );
}
