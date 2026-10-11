import type { ReactElement } from 'react';
import { AssetsStep, type AssetsStepSlots } from '../components/assets-step';

export function AssetsStepPage(props: AssetsStepSlots): ReactElement {
    return <AssetsStep {...props} />;
}
