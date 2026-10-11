import type { ReactElement } from 'react';
import * as RadioGroup from '@radix-ui/react-radio-group';
import { Check } from 'lucide-react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { cn } from '@/shared/lib/cn';
import { CLASS_COLOR_KEYS, type ClassColorKey } from '../../types';
import { toClassColorKey } from '../../lib/class-color';

export const COLOR_SWATCHES: Readonly<Record<ClassColorKey, string>> = {
    c1: 'bg-class-1',
    c2: 'bg-class-2',
    c3: 'bg-class-3',
    c4: 'bg-class-4',
    c5: 'bg-class-5',
    c6: 'bg-class-6',
    c7: 'bg-class-7',
    c8: 'bg-class-8',
    c9: 'bg-class-9',
    c10: 'bg-class-10',
    c11: 'bg-class-11',
    c12: 'bg-class-12'
};

export interface ColorPickerProps {
    readonly value: ClassColorKey;
    readonly onChange: (colorKey: ClassColorKey) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps): ReactElement {
    const { t }: UseTranslationResponse<'portfolioTargets', undefined> = useTranslation('portfolioTargets');
    return (
        <RadioGroup.Root
            value={value}
            aria-label={t('classes.form.colorLabel')}
            onValueChange={(next: string): void => {
                onChange(toClassColorKey(next));
            }}
            className="flex flex-wrap gap-2"
        >
            {CLASS_COLOR_KEYS.map((colorKey: ClassColorKey): ReactElement => (
                <RadioGroup.Item
                    key={colorKey}
                    value={colorKey}
                    aria-label={t('classes.form.colorOption', { number: colorKey.slice(1) })}
                    className={cn(
                        'flex size-8 items-center justify-center rounded-full text-accent-contrast transition',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
                        COLOR_SWATCHES[colorKey]
                    )}
                >
                    <RadioGroup.Indicator>
                        <Check className="size-4" aria-hidden="true" strokeWidth={3} />
                    </RadioGroup.Indicator>
                </RadioGroup.Item>
            ))}
        </RadioGroup.Root>
    );
}
