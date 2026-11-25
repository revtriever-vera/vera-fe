import type { ReactElement } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Alert } from '@/shared/ui/alert';
import { Skeleton } from '@/shared/ui/skeleton';
import { useClasses } from '../../api/use-classes.query';
import type { AssetClassView, ClassesResponse } from '../../types';
import type { TitleChoice, TitleChoices } from '../lib/title-choices';
import type { ImportedTitle } from '../schemas/imported-title.schema';
import { ImportedTitleCard } from './imported-title-card';

export interface FixedIncomeSectionProps {
    readonly titles: readonly ImportedTitle[];
    readonly choices: TitleChoices;
    readonly holder: string;
    readonly onChoose: (lineId: string, choice: TitleChoice | null) => void;
}

export function FixedIncomeSection({ titles, choices, holder, onChoose }: FixedIncomeSectionProps): ReactElement | null {
    const { t }: UseTranslationResponse<'portfolioImports', undefined> = useTranslation('portfolioImports');
    const classes: UseQueryResult<ClassesResponse> = useClasses();
    if (titles.length === 0) {
        return null;
    }
    if (classes.isError) {
        return <Alert title={t('errors.generic')} />;
    }
    if (classes.data === undefined) {
        return <Skeleton className="h-24 w-full" />;
    }
    const available: readonly AssetClassView[] = classes.data.data;
    return (
        <section className="flex flex-col gap-2">
            <h3 className="text-base font-semibold text-content">{t('fixedIncome.title')}</h3>
            <ul aria-label={t('fixedIncome.label')} className="flex flex-col gap-3">
                {titles.map((title: ImportedTitle): ReactElement => (
                    <ImportedTitleCard
                        key={title.lineId}
                        title={title}
                        choice={choices[title.lineId]}
                        classes={available}
                        holder={holder}
                        onChoose={(choice: TitleChoice | null): void => {
                            onChoose(title.lineId, choice);
                        }}
                    />
                ))}
            </ul>
        </section>
    );
}
