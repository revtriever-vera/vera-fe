import { useId, type ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { SelectMenu } from '@/shared/ui/select-menu';
import { LANGUAGE_CHOICES } from '../lib/languages';
import { useLanguageChange, type LanguageChange } from '../lib/use-language-change';
import { AccountSection } from './account-section';

export function LanguageCard(): ReactElement {
    const { t }: UseTranslationResponse<'account', undefined> = useTranslation('account');
    const labelId: string = useId();
    const language: LanguageChange = useLanguageChange();

    return (
        <AccountSection title={t('languageTitle')} description={t('languageDescription')}>
            <span id={labelId} className="text-sm font-medium text-content">
                {t('languageLabel')}
            </span>
            <SelectMenu
                value={language.locale}
                choices={LANGUAGE_CHOICES.map(({ value, label }) => ({ value, label, warning: null }))}
                placeholder={t('languageLabel')}
                ariaLabelledBy={labelId}
                disabled={language.pending}
                className="max-w-xs"
                onChange={language.change}
            />
        </AccountSection>
    );
}
