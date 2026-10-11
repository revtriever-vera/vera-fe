import type { ReactElement } from 'react';
import { TriangleAlert } from 'lucide-react';
import { Trans } from 'react-i18next';
import { track } from '@/shared/lib/analytics';
import { PLUGGY_HOSTS, PLUGGY_LINKS, type PluggyTarget } from '@/shared/lib/pluggy-links';

const LINK_CLASS: string = 'font-semibold text-accent-strong underline underline-offset-2';
const KBD_CLASS: string = 'rounded-sm border border-border bg-surface-muted px-1.5 py-0.5 font-mono text-xs text-content';

function ExternalLink({ target, children }: { readonly target: Exclude<PluggyTarget, 'github'>; readonly children: string }): ReactElement {
    return (
        <a
            href={PLUGGY_LINKS[target]}
            target="_blank"
            rel="noopener noreferrer"
            className={LINK_CLASS}
            onClick={(): void => {
                track('onboarding_pluggy_link_clicked', { target });
            }}
        >
            {children}
        </a>
    );
}

export function PluggySteps(): ReactElement {
    return (
        <div>
            <ol className="grid list-decimal gap-2.5 pl-5 text-sm leading-relaxed text-content-muted marker:font-bold marker:text-accent-strong">
                <li>
                    <Trans
                        i18nKey="pluggyStep1"
                        ns="onboarding"
                        components={{ meu: <ExternalLink target="meu">{PLUGGY_HOSTS.meu}</ExternalLink> }}
                    />
                </li>
                <li>
                    <Trans
                        i18nKey="pluggyStep2"
                        ns="onboarding"
                        components={{ dashboard: <ExternalLink target="dashboard">{PLUGGY_HOSTS.dashboard}</ExternalLink> }}
                    />
                </li>
                <li>
                    <Trans i18nKey="pluggyStep3" ns="onboarding" components={{ kbd: <kbd className={KBD_CLASS} /> }} />
                </li>
                <li>
                    <Trans i18nKey="pluggyStep4" ns="onboarding" components={{ kbd: <kbd className={KBD_CLASS} /> }} />
                </li>
            </ol>
            <p className="mt-4 flex items-start gap-2.5 rounded-control border border-caution/30 bg-caution/10 p-3 text-[13.5px] leading-relaxed text-content">
                <TriangleAlert className="mt-0.5 size-4 shrink-0 text-caution" aria-hidden="true" />
                <span>
                    <Trans i18nKey="pluggyTrialWarning" ns="onboarding" components={{ strong: <b /> }} />
                </span>
            </p>
        </div>
    );
}
