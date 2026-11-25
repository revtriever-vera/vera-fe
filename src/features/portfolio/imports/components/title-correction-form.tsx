import type { ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Button } from '@/shared/ui/button';
import { FixedIncomeForm } from '../../assets/components/fixed-income-form';
import type { CreateTitleBody } from '../../assets/types';
import type { AssetClassView } from '../../types';
import { useTitleCorrection, type TitleCorrection } from '../lib/use-title-correction';
import type { ImportedTitle } from '../schemas/imported-title.schema';

export interface TitleCorrectionFormProps {
    readonly title: ImportedTitle;
    readonly classes: readonly AssetClassView[];
    readonly holder: string;
    readonly onSave: (body: CreateTitleBody) => void;
    readonly onCancel: () => void;
    readonly onSkip: () => void;
}

export function TitleCorrectionForm({ title, classes, holder, onSave, onCancel, onSkip }: TitleCorrectionFormProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioImports', undefined> = useTranslation('portfolioImports');
    const formId: string = `${title.lineId}-title-form`;
    const state: TitleCorrection = useTitleCorrection({ title, classes, holder, onSave });
    return (
        <div className="flex flex-col gap-3">
            <h4 className="text-sm font-semibold text-content">{t('fixedIncome.formTitle', { product: title.product })}</h4>
            <FixedIncomeForm
                form={state.form}
                classes={classes}
                today={state.today}
                formId={formId}
                alertMessage={null}
                onIndexerChange={state.changeIndexer}
                onKindChange={state.changeKind}
                onIssuerChange={state.changeIssuer}
                onNameEdit={state.markNameTouched}
                onSubmit={(): void => {
                    void state.submit();
                }}
            />
            <div className="flex flex-wrap gap-2">
                <Button type="submit" form={formId}>
                    {t('fixedIncome.save')}
                </Button>
                <Button variant="ghost" onClick={onCancel}>
                    {t('fixedIncome.back')}
                </Button>
                <Button variant="ghost" onClick={onSkip}>
                    {t('fixedIncome.skip')}
                </Button>
            </div>
        </div>
    );
}
