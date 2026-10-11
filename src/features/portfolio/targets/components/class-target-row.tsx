import type { ReactElement } from 'react';
import { Link } from '@tanstack/react-router';
import { useController, type Control, type UseControllerReturn } from 'react-hook-form';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { ClassName } from '../../components/class-name';
import { ClassTile } from '../../components/class-tile';
import { toClassColorKey } from '../../lib/class-color';
import { isSystemClassKey } from '../../lib/class-icons';
import { useClassLabel, type ClassLabel } from '../../lib/use-class-label';
import type { AssetClassView } from '../../types';
import { FULL_TARGET_BPS, type ClassTargetsFormValues } from '../schemas/class-targets.schema';
import { PercentStepper } from './percent-stepper';

export interface ClassTargetRowProps {
    readonly index: number;
    readonly assetClass: AssetClassView;
    readonly today: string;
    readonly control: Control<ClassTargetsFormValues>;
}

const STEP_BPS: number = 100;

function ClassDescription({ systemKey }: { readonly systemKey: string | null }): ReactElement | null {
    const { t }: UseTranslationResponse<'portfolio', undefined> = useTranslation('portfolio');
    if (systemKey === null || !isSystemClassKey(systemKey)) {
        return null;
    }
    return <span className="block text-xs text-content-muted">{t(`classes.descriptions.${systemKey}`)}</span>;
}

function ClassIdentity({ assetClass }: { readonly assetClass: AssetClassView }): ReactElement {
    return (
        <span className="col-span-2 flex min-w-0 items-center gap-3 md:col-span-1">
            <ClassTile systemKey={assetClass.systemKey} colorKey={toClassColorKey(assetClass.colorKey)} />
            <span className="min-w-0">
                <ClassName systemKey={assetClass.systemKey} name={assetClass.name} className="block truncate text-sm font-semibold" />
                <ClassDescription systemKey={assetClass.systemKey} />
            </span>
        </span>
    );
}

function TargetStepper({ index, control, name }: TargetStepperProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioTargets', undefined> = useTranslation('portfolioTargets');
    const path: `targets.${number}.targetBps` = `targets.${String(index) as `${number}`}.targetBps`;
    const controller: UseControllerReturn<ClassTargetsFormValues> = useController({ control, name: path });
    return (
        <PercentStepper
            value={controller.field.value as number}
            onChange={controller.field.onChange}
            stepBps={STEP_BPS}
            minBps={0}
            maxBps={FULL_TARGET_BPS}
            inputLabel={t('targets.targetLabel', { name })}
            decreaseLabel={t('targets.decrease', { name })}
            increaseLabel={t('targets.increase', { name })}
            error={controller.fieldState.error?.message}
        />
    );
}

interface TargetStepperProps {
    readonly index: number;
    readonly control: Control<ClassTargetsFormValues>;
    readonly name: string;
}

export function ClassTargetRow({ index, assetClass, today, control }: ClassTargetRowProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioTargets', undefined> = useTranslation('portfolioTargets');
    const label: ClassLabel = useClassLabel();
    const name: string = label(assetClass.systemKey, assetClass.name);
    return (
        <li className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-2 py-3 md:grid-cols-[minmax(0,1fr)_5rem_auto_4.5rem] md:gap-y-0">
            <ClassIdentity assetClass={assetClass} />
            <span className="text-left text-sm tabular-nums text-content-muted md:text-right">
                <span className="mr-1 text-xs md:sr-only">{t('targets.columns.today')}</span>
                {today}
            </span>
            <TargetStepper index={index} control={control} name={name} />
            <Link
                to="/patrimonio/classes/$classId"
                params={{ classId: assetClass.id }}
                aria-label={t('targets.assetsLinkLabel', { name })}
                className="col-span-2 justify-self-start text-sm font-semibold text-accent-strong underline-offset-2 hover:underline md:col-span-1 md:justify-self-end"
            >
                {t('targets.assetsLink')}
            </Link>
        </li>
    );
}
