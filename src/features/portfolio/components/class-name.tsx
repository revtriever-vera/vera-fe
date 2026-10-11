import type { ReactElement } from 'react';
import { useClassLabel, type ClassLabel } from '../lib/use-class-label';

export interface ClassNameProps {
    readonly systemKey: string | null;
    readonly name: string | null;
    readonly className?: string;
}

export function ClassName({ systemKey, name, className }: ClassNameProps): ReactElement {
    const label: ClassLabel = useClassLabel();
    return <span className={className}>{label(systemKey, name)}</span>;
}
