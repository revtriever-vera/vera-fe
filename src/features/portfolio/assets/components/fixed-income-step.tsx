import type { ReactElement } from 'react';
import type { AssetClassView } from '../../types';
import { typeColorKey } from '../lib/asset-types';
import { useFixedIncomeForm, type FixedIncomeFormState } from '../lib/use-fixed-income-form';
import { DetailsFrame } from './details-frame';
import { FixedIncomeForm } from './fixed-income-form';
import { FixedIncomePreviewPanel } from './fixed-income-preview';

const FORM_ID: string = 'add-fixed-income-form';

export interface FixedIncomeStepProps {
    readonly classes: readonly AssetClassView[];
    readonly initialClassId: string | undefined;
    readonly onBack: () => void;
    readonly onClose: () => void;
}

export function FixedIncomeStep({ classes, initialClassId, onBack, onClose }: FixedIncomeStepProps): ReactElement {
    const state: FixedIncomeFormState = useFixedIncomeForm({ classes, initialClassId, onSaved: onClose });
    return (
        <DetailsFrame
            type="fixed_income"
            colorKey={typeColorKey(classes, 'fixed_income')}
            submit={{ formId: FORM_ID, disabled: !state.canSubmit, busy: state.busy }}
            onBack={onBack}
            onClose={onClose}
            left={
                <FixedIncomeForm
                    form={state.form}
                    classes={classes}
                    today={state.today}
                    formId={FORM_ID}
                    alertMessage={state.alertMessage}
                    onIndexerChange={state.changeIndexer}
                    onSubmit={(): void => {
                        void state.submit();
                    }}
                />
            }
            right={<FixedIncomePreviewPanel values={state.values} termsValid={state.termsValid} classes={classes} />}
        />
    );
}
