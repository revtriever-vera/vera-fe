import { useEffect, useMemo } from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import type { z } from 'zod';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { toTitleBody } from '../../assets/lib/fixed-income-body';
import { indexerClassKey, localTodayIso } from '../../assets/lib/fixed-income-defaults';
import { defaultClassId } from '../../assets/lib/position-defaults';
import { useIssuerHandlers, type IssuerHandlers } from '../../assets/lib/use-issuer-handlers';
import { createFixedIncomeSchema, type FixedIncomeFormInput } from '../../assets/schemas/fixed-income.schema';
import type { CreateTitleBody, FixedIncomeIndexer } from '../../assets/types';
import { usePeople, type PeopleState } from '../../lib/people-context';
import { bpsToInput } from '../../lib/parse-percent-input';
import type { AssetClassView } from '../../types';
import type { ImportedTitle } from '../schemas/imported-title.schema';

const DEFAULT_KIND: FixedIncomeFormInput['kind'] = 'cdb';
const DEFAULT_INDEXER: FixedIncomeIndexer = 'cdi_percent';

export function titleDefaults(
    title: ImportedTitle,
    classes: readonly AssetClassView[],
    holder: string,
    locale: SupportedLocale
): FixedIncomeFormInput {
    const indexer: FixedIncomeIndexer = title.indexer ?? DEFAULT_INDEXER;
    return {
        kind: title.kind ?? DEFAULT_KIND,
        issuer: title.issuer,
        name: title.product,
        indexer,
        rate: title.rateBps === null ? '' : bpsToInput(title.rateBps, locale),
        applied: title.appliedMinor,
        currency: 'BRL',
        appliedAt: title.appliedAt,
        maturityDate: title.maturityDate,
        classId: defaultClassId(classes, indexerClassKey(indexer), undefined),
        holder
    };
}

export interface TitleCorrectionParams {
    readonly title: ImportedTitle;
    readonly classes: readonly AssetClassView[];
    readonly holder: string;
    readonly onSave: (body: CreateTitleBody) => void;
}

export interface TitleCorrection extends IssuerHandlers {
    readonly form: UseFormReturn<FixedIncomeFormInput>;
    readonly today: string;
    readonly submit: () => Promise<void>;
    readonly changeIndexer: (indexer: FixedIncomeIndexer) => void;
}

export function useTitleCorrection({ title, classes, holder, onSave }: TitleCorrectionParams): TitleCorrection {
    const { t }: UseTranslationResponse<'portfolioAssets', undefined> = useTranslation('portfolioAssets');
    const locale: SupportedLocale = useLocale();
    const { multi }: PeopleState = usePeople();
    const today: string = useMemo((): string => localTodayIso(), []);
    const schema: z.ZodType<FixedIncomeFormInput> = useMemo(
        (): z.ZodType<FixedIncomeFormInput> => createFixedIncomeSchema(t, today),
        [t, today]
    );
    const form: UseFormReturn<FixedIncomeFormInput> = useForm<FixedIncomeFormInput>({
        resolver: zodResolver(schema),
        mode: 'onTouched',
        defaultValues: titleDefaults(title, classes, holder, locale)
    });
    const handlers: IssuerHandlers = useIssuerHandlers(form, 'edit');
    useEffect((): void => {
        void form.trigger();
    }, [form]);
    const submit: () => Promise<void> = form.handleSubmit((input: FixedIncomeFormInput): void => {
        const body: CreateTitleBody | null = toTitleBody(input, multi);
        if (body !== null) {
            onSave(body);
        }
    });
    const changeIndexer = (indexer: FixedIncomeIndexer): void => {
        form.setValue('indexer', indexer, { shouldValidate: true });
        if (indexer !== 'prefixed') {
            form.setValue('currency', 'BRL');
        }
        if (!form.getFieldState('classId').isDirty) {
            form.setValue('classId', defaultClassId(classes, indexerClassKey(indexer), undefined));
        }
    };
    return { form, today, submit, changeIndexer, ...handlers };
}
