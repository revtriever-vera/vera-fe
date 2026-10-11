import type { ReactElement } from 'react';
import { useController, type Control, type UseControllerReturn } from 'react-hook-form';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import type { AssetTargetsFormValues } from '../schemas/asset-targets.schema';
import { FULL_ASSET_TARGET_BPS } from '../schemas/asset-targets.schema';
import { PercentStepper } from './percent-stepper';

export interface AssetTargetInputProps {
    readonly index: number;
    readonly symbol: string;
    readonly control: Control<AssetTargetsFormValues>;
}

const STEP_BPS: number = 100;

export function AssetTargetInput({ index, symbol, control }: AssetTargetInputProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioTargets', undefined> = useTranslation('portfolioTargets');
    const path: `targets.${number}.targetBps` = `targets.${String(index) as `${number}`}.targetBps`;
    const controller: UseControllerReturn<AssetTargetsFormValues> = useController({ control, name: path });
    return (
        <PercentStepper
            value={controller.field.value as number}
            onChange={controller.field.onChange}
            stepBps={STEP_BPS}
            minBps={0}
            maxBps={FULL_ASSET_TARGET_BPS}
            inputLabel={t('classDetail.targetLabel', { symbol })}
            decreaseLabel={t('classDetail.decrease', { symbol })}
            increaseLabel={t('classDetail.increase', { symbol })}
            error={controller.fieldState.error?.message}
        />
    );
}
