import type { ReactElement } from 'react';
import { ExternalLink } from 'lucide-react';
import { Trans, useTranslation, type UseTranslationResponse } from 'react-i18next';
import { track } from '@/shared/lib/analytics';
import { PLUGGY_HOSTS, PLUGGY_LINKS, type PluggyTarget } from '@/shared/lib/pluggy-links';
import { Alert } from '@/shared/ui/alert';
import type { TutorialStepDefinition } from '../lib/tutorial-steps';

const KBD_CLASS: string = 'rounded-sm border border-border bg-surface-muted px-1.5 py-0.5 font-mono text-xs text-content';

export function tutorialStepId(step: number): string {
    return `tutorial-step-${String(step)}`;
}

export function PluggyLink({ target, children }: { readonly target: PluggyTarget; readonly children?: string }): ReactElement {
    const { t }: UseTranslationResponse<'spendingConnections', undefined> = useTranslation('spendingConnections');
    return (
        <a
            href={PLUGGY_LINKS[target]}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-accent-strong underline underline-offset-2"
            onClick={(): void => {
                track('spending_pluggy_link_clicked', { target });
            }}
        >
            {children ?? PLUGGY_HOSTS[target]}
            <ExternalLink className="size-3.5" aria-hidden="true" />
            <span className="sr-only">{t('tutorial.newTab')}</span>
        </a>
    );
}

interface TutorialStepProps {
    readonly definition: TutorialStepDefinition;
    readonly done: boolean;
    readonly onToggle: (step: number) => void;
}

export function TutorialStep({ definition, done, onToggle }: TutorialStepProps): ReactElement {
    const { t }: UseTranslationResponse<'spendingConnections', undefined> = useTranslation('spendingConnections');
    return (
        <li
            id={tutorialStepId(definition.step)}
            className="flex flex-col gap-2 text-sm text-content-muted marker:font-bold marker:text-accent-strong"
        >
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h3 tabIndex={-1} className="text-sm font-semibold text-content outline-none">
                    {t(definition.title)}
                </h3>
                {definition.link === null ? null : <PluggyLink target={definition.link} />}
            </div>
            <ul className="flex list-disc flex-col gap-1 pl-5">
                {definition.lines.map((line): ReactElement => (
                    <li key={line}>
                        <Trans i18nKey={line} ns="spendingConnections" components={{ kbd: <kbd className={KBD_CLASS} />, b: <b /> }} />
                    </li>
                ))}
            </ul>
            {definition.warning === null ? null : <Alert tone="caution" title={t(definition.warning)} />}
            <label className="flex items-center gap-2 text-xs text-content-muted">
                <input
                    type="checkbox"
                    className="size-4 accent-accent"
                    checked={done}
                    aria-label={t('tutorial.doneStep', { step: definition.step })}
                    onChange={(): void => {
                        onToggle(definition.step);
                    }}
                />
                {t('tutorial.done')}
            </label>
        </li>
    );
}
