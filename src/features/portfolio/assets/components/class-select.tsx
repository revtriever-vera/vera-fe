import type { ReactElement } from 'react';
import type { SelectChoice } from '@/shared/ui/select-menu';
import { useClassLabel, type ClassLabel } from '../../lib/use-class-label';
import type { AssetClassView } from '../../types';
import { LabeledSelect } from './labeled-select';

export interface ClassSelectProps {
    readonly label: string;
    readonly placeholder: string;
    readonly value: string;
    readonly classes: readonly AssetClassView[];
    readonly error?: string;
    readonly hint?: string;
    readonly onChange: (classId: string) => void;
}

export function ClassSelect({ classes, ...rest }: ClassSelectProps): ReactElement {
    const classLabel: ClassLabel = useClassLabel();
    const choices: readonly SelectChoice[] = classes.map((item: AssetClassView): SelectChoice => ({
        value: item.id,
        label: classLabel(item.systemKey, item.name),
        warning: null
    }));
    return <LabeledSelect choices={choices} {...rest} />;
}
