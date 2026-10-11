import type { ReactElement } from 'react';
import { BanksStep, type BanksStepSlots } from '../components/banks-step';

export function BanksStepPage(props: BanksStepSlots): ReactElement {
    return <BanksStep {...props} />;
}
