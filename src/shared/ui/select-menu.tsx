import type { ReactElement, ReactNode } from 'react';
import * as Select from '@radix-ui/react-select';
import { Check, ChevronDown, TriangleAlert } from 'lucide-react';
import { Balloon } from './tooltip';
import { cn } from '@/shared/lib/cn';

export interface SelectChoice {
    readonly value: string;
    readonly label: string;
    readonly warning: string | null;
    readonly icon?: ReactNode;
}

export interface SelectMenuProps {
    readonly value: string;
    readonly choices: readonly SelectChoice[];
    readonly placeholder: string;
    readonly ariaLabelledBy?: string;
    readonly ariaDescribedBy?: string;
    readonly invalid?: boolean;
    readonly disabled?: boolean;
    readonly leading?: ReactNode;
    readonly className?: string;
    readonly showCheck?: boolean;
    readonly onChange: (value: string) => void;
}

const TRIGGER: string =
    'flex w-full items-center justify-between gap-2 rounded-control border border-border bg-surface-muted px-3 py-2 text-sm text-content data-[placeholder]:text-content-subtle';
const CONTENT: string = 'z-50 w-[var(--radix-select-trigger-width)] rounded-control border border-border bg-surface shadow-lg';
const ITEM: string =
    'flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-content outline-none data-[highlighted]:bg-surface-muted data-[state=checked]:font-medium';

function SelectMenuChoice({ choice, showCheck }: { readonly choice: SelectChoice; readonly showCheck: boolean }): ReactElement {
    return (
        <Select.Item key={choice.value} value={choice.value} className={ITEM}>
            {showCheck ? (
                <span className="flex w-4 shrink-0 justify-center" aria-hidden>
                    <Select.ItemIndicator>
                        <Check className="h-3.5 w-3.5 text-accent-strong" aria-hidden />
                    </Select.ItemIndicator>
                </span>
            ) : null}
            {choice.icon === undefined ? null : (
                <span className="flex w-5 shrink-0 justify-center" aria-hidden>
                    {choice.icon}
                </span>
            )}
            <Select.ItemText>{choice.label}</Select.ItemText>
            {choice.warning === null ? null : (
                <Balloon text={choice.warning}>
                    <span className="ml-auto flex" aria-label={choice.warning}>
                        <TriangleAlert className="h-3.5 w-3.5 text-caution" aria-hidden />
                    </span>
                </Balloon>
            )}
        </Select.Item>
    );
}

function SelectMenuTrigger({
    placeholder,
    ariaLabelledBy,
    ariaDescribedBy,
    invalid,
    leading,
    className
}: Pick<SelectMenuProps, 'placeholder' | 'ariaLabelledBy' | 'ariaDescribedBy' | 'invalid' | 'leading' | 'className'>): ReactElement {
    return (
        <Select.Trigger
            className={cn(TRIGGER, 'disabled:opacity-60', className)}
            aria-labelledby={ariaLabelledBy}
            aria-describedby={ariaDescribedBy}
            aria-invalid={invalid === true ? true : undefined}
        >
            <span className="flex min-w-0 items-center gap-2">
                {leading === undefined ? null : (
                    <span className="flex w-5 shrink-0 justify-center" aria-hidden>
                        {leading}
                    </span>
                )}
                <span className="truncate">
                    <Select.Value placeholder={placeholder} />
                </span>
            </span>
            <Select.Icon>
                <ChevronDown className="h-4 w-4 text-content-subtle" aria-hidden />
            </Select.Icon>
        </Select.Trigger>
    );
}

export function SelectMenu({
    value,
    choices,
    placeholder,
    ariaLabelledBy,
    ariaDescribedBy,
    invalid,
    disabled,
    leading,
    className,
    showCheck = true,
    onChange
}: SelectMenuProps): ReactElement {
    return (
        <Select.Root value={value === '' ? undefined : value} disabled={disabled} onValueChange={onChange}>
            <SelectMenuTrigger
                placeholder={placeholder}
                ariaLabelledBy={ariaLabelledBy}
                ariaDescribedBy={ariaDescribedBy}
                invalid={invalid}
                leading={leading}
                className={className}
            />
            <Select.Portal>
                <Select.Content position="popper" sideOffset={4} className={CONTENT}>
                    <Select.Viewport className="max-h-[280px] p-1">
                        {choices.map((choice: SelectChoice): ReactElement => (
                            <SelectMenuChoice key={choice.value} choice={choice} showCheck={showCheck} />
                        ))}
                    </Select.Viewport>
                </Select.Content>
            </Select.Portal>
        </Select.Root>
    );
}
