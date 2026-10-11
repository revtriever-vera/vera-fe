import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { CategoriesSection } from '../components/categories-section';
import { RulesSection } from '../components/rules-section';
import { DICTIONARY_README_URL } from '../lib/rule-labels';

export function RulesPage(): ReactElement {
    const { t }: UseTranslationResponse<'spendingRules', undefined> = useTranslation('spendingRules');
    return (
        <div className="flex flex-col gap-8">
            <RulesSection />
            <CategoriesSection />
            <p className="text-sm text-content-muted">
                {t('footer.dictionary')}{' '}
                <a href={DICTIONARY_README_URL} target="_blank" rel="noreferrer" className="font-semibold text-accent-strong underline">
                    {t('footer.link')}
                </a>
            </p>
        </div>
    );
}
