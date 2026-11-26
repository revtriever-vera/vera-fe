import { useId, type ReactElement } from 'react';
import { Link } from '@tanstack/react-router';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Card } from '@/shared/ui/card';
import { useChanges } from '../api/use-changes.query';
import { changesLockOf } from '../lib/locked-count';
import { PREVIEW_SIZE, type ChangeItem } from '../types';
import type { HolderParam } from '../../lib/holder-filter';
import { useHolderParam } from '../../lib/use-holder-param';
import { ChangeItemRow } from './change-item-row';
import { ChangesLocked } from './changes-locked';
import { ChangesNotice } from './changes-notice';

export function ChangesPreview(): ReactElement | null {
    const { t }: UseTranslationResponse<'portfolioChanges', undefined> = useTranslation('portfolioChanges');
    const holder: HolderParam = useHolderParam();
    const titleId: string = useId();
    const changes: ReturnType<typeof useChanges> = useChanges('7', holder);
    const lock: ReturnType<typeof changesLockOf> = changesLockOf(changes.error);
    if (lock !== null) {
        return <ChangesLocked lock={lock} />;
    }
    if (changes.data === undefined || changes.data.items.length === 0) {
        return null;
    }
    const items: readonly ChangeItem[] = changes.data.items.slice(0, PREVIEW_SIZE);
    return (
        <Card role="region" aria-labelledby={titleId} className="flex flex-col gap-2">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 id={titleId} className="text-base font-semibold">
                    {t('title')}
                </h3>
                <Link
                    to="/portfolio/changes"
                    search={{ holder }}
                    className="text-sm font-semibold text-accent-strong underline underline-offset-2"
                >
                    {t('seeAll')}
                </Link>
            </div>
            <ul className="flex flex-col divide-y divide-border">
                {items.map((item: ChangeItem): ReactElement => (
                    <ChangeItemRow key={item.id} item={item} />
                ))}
            </ul>
            <ChangesNotice />
        </Card>
    );
}
