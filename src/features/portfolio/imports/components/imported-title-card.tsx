import { useState, type ReactElement } from 'react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import type { CreateTitleBody } from '../../assets/types';
import type { AssetClassView } from '../../types';
import { titleHasAssumedFacePrice, titleMaturityText, titleRateText, titleReasonText } from '../lib/title-text';
import type { TitleChoice } from '../lib/title-choices';
import { TITLE_STATUS, type ImportedTitle } from '../schemas/imported-title.schema';
import { TitleCorrectionForm } from './title-correction-form';

export interface ImportedTitleCardProps {
    readonly title: ImportedTitle;
    readonly choice: TitleChoice | undefined;
    readonly classes: readonly AssetClassView[];
    readonly holder: string;
    readonly onChoose: (choice: TitleChoice | null) => void;
}

function Sentence({ title, choice }: Pick<ImportedTitleCardProps, 'title' | 'choice'>): ReactElement {
    const { t }: UseTranslationResponse<'portfolioImports', undefined> = useTranslation('portfolioImports');
    const locale: SupportedLocale = useLocale();
    const params: { product: string; rate: string; maturity: string } = {
        product: title.product,
        rate: titleRateText(t, title, locale),
        maturity: titleMaturityText(t, title, locale)
    };
    if (choice?.type === 'skip') {
        return <p className="text-sm text-content-muted">{t('fixedIncome.skipped')}</p>;
    }
    if (choice?.type === 'confirm') {
        return <p className="text-sm text-content">{t('fixedIncome.confirmed')}</p>;
    }
    if (choice?.type === 'edit') {
        return <p className="text-sm text-content">{t('fixedIncome.corrected')}</p>;
    }
    if (title.status === TITLE_STATUS.needsInput) {
        return <p className="text-sm text-content">{t('fixedIncome.needsInput', params)}</p>;
    }
    if (title.status === TITLE_STATUS.check) {
        return <p className="text-sm text-content">{t('fixedIncome.check', { ...params, reason: titleReasonText(t, title.reason) })}</p>;
    }
    return <p className="text-sm font-semibold text-content">{t('fixedIncome.found', params)}</p>;
}

function FacePriceNotice({ title, choice }: Pick<ImportedTitleCardProps, 'title' | 'choice'>): ReactElement | null {
    const { t }: UseTranslationResponse<'portfolioImports', undefined> = useTranslation('portfolioImports');
    if (!titleHasAssumedFacePrice(title) || choice !== undefined) {
        return null;
    }
    return <p className="text-sm text-content-muted">{t('fixedIncome.assumedFacePrice')}</p>;
}

interface ActionsProps extends Pick<ImportedTitleCardProps, 'title' | 'choice' | 'onChoose'> {
    readonly onFix: () => void;
}

function ActiveActions({ title, choice, onChoose, onFix }: ActionsProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioImports', undefined> = useTranslation('portfolioImports');
    const canConfirm: boolean = title.status !== TITLE_STATUS.needsInput && choice === undefined;
    return (
        <div className="flex flex-wrap gap-2">
            {canConfirm ? (
                <Button
                    size="sm"
                    onClick={(): void => {
                        onChoose({ type: 'confirm' });
                    }}
                >
                    {t('fixedIncome.confirm')}
                </Button>
            ) : null}
            <Button variant="secondary" size="sm" onClick={onFix}>
                {t('fixedIncome.fix')}
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={(): void => {
                    onChoose({ type: 'skip' });
                }}
            >
                {t('fixedIncome.skip')}
            </Button>
        </div>
    );
}

function Actions(props: ActionsProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioImports', undefined> = useTranslation('portfolioImports');
    if (props.choice?.type !== 'skip') {
        return <ActiveActions {...props} />;
    }
    return (
        <Button
            variant="secondary"
            size="sm"
            className="self-start"
            onClick={(): void => {
                props.onChoose(null);
            }}
        >
            {t('fixedIncome.unskip')}
        </Button>
    );
}

function Body(props: ImportedTitleCardProps): ReactElement {
    const { title, choice, classes, holder, onChoose } = props;
    const [editing, setEditing] = useState<boolean>(title.status === TITLE_STATUS.needsInput && choice === undefined);
    if (editing) {
        return (
            <TitleCorrectionForm
                title={title}
                classes={classes}
                holder={holder}
                onSave={(edits: CreateTitleBody): void => {
                    onChoose({ type: 'edit', edits });
                    setEditing(false);
                }}
                onCancel={(): void => {
                    setEditing(false);
                }}
                onSkip={(): void => {
                    onChoose({ type: 'skip' });
                    setEditing(false);
                }}
            />
        );
    }
    return (
        <>
            <Sentence title={title} choice={choice} />
            <FacePriceNotice title={title} choice={choice} />
            <Actions
                title={title}
                choice={choice}
                onChoose={onChoose}
                onFix={(): void => {
                    setEditing(true);
                }}
            />
        </>
    );
}

export function ImportedTitleCard(props: ImportedTitleCardProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioImports', undefined> = useTranslation('portfolioImports');
    const { title } = props;
    if (title.status === TITLE_STATUS.duplicate) {
        return (
            <li className="rounded-card border border-border bg-surface p-3 text-sm text-content-muted">
                {t('fixedIncome.duplicate', { product: title.product })}
            </li>
        );
    }
    return (
        <li className="flex flex-col gap-2 rounded-card border border-border bg-surface p-3">
            <Badge className="self-start">{title.product}</Badge>
            <Body {...props} />
        </li>
    );
}
