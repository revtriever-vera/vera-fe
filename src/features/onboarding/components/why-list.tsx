import type { LucideIcon } from 'lucide-react';
import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { IconTile } from '@/shared/ui/icon-tile';

export interface WhyItem {
    readonly icon: LucideIcon;
    readonly title: string;
    readonly detail: string;
}

export function WhyList({ items }: { readonly items: readonly WhyItem[] }): ReactElement {
    const { t }: UseTranslationResponse<'onboarding', undefined> = useTranslation('onboarding');

    return (
        <section className="mt-5">
            <h2 className="mb-2.5 text-xs font-bold tracking-[0.07em] text-content-muted uppercase">{t('whyHeading')}</h2>
            <ul className="grid gap-3">
                {items.map((item: WhyItem): ReactElement => (
                    <li key={item.title} className="flex items-start gap-3">
                        <IconTile icon={item.icon} tone="accent" size="sm" />
                        <span className="flex min-w-0 flex-col text-sm">
                            <b className="text-content">{item.title}</b>
                            <span className="text-content-muted">{item.detail}</span>
                        </span>
                    </li>
                ))}
            </ul>
        </section>
    );
}
