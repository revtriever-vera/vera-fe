import { createElement, type ReactElement } from 'react';
import * as Menu from '@radix-ui/react-dropdown-menu';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { cn } from '@/shared/lib/cn';
import { categoryIcon } from '../../lib/category-icons';
import { ICON_KEYS, type IconKey } from '../../types';

export interface IconPickerProps {
    readonly value: IconKey;
    readonly onChange: (icon: IconKey) => void;
    readonly label: string;
    readonly disabled?: boolean;
}

const GLYPH_PROPS: { className: string; 'aria-hidden': boolean } = { className: 'size-4', 'aria-hidden': true };
const TRIGGER: string =
    'inline-flex size-9 items-center justify-center rounded-control border border-border bg-surface-muted text-content-muted transition-colors hover:text-content disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent';
const CONTENT: string = 'z-[70] grid w-64 grid-cols-6 gap-1 rounded-card border border-border bg-surface p-2 shadow-popover';
const ITEM: string =
    'flex size-9 cursor-pointer items-center justify-center rounded-control text-content-muted outline-none data-[highlighted]:bg-surface-muted data-[highlighted]:text-content';

export function IconPicker({ value, onChange, label, disabled = false }: IconPickerProps): ReactElement {
    const { t }: UseTranslationResponse<'spendingRules', undefined> = useTranslation('spendingRules');
    return (
        <Menu.Root>
            <Menu.Trigger asChild>
                <button type="button" aria-label={label} disabled={disabled} className={TRIGGER}>
                    {createElement(categoryIcon(value), GLYPH_PROPS)}
                </button>
            </Menu.Trigger>
            <Menu.Portal>
                <Menu.Content align="start" sideOffset={6} aria-label={t('categories.iconMenu')} className={CONTENT}>
                    {ICON_KEYS.map((key: IconKey): ReactElement => {
                        return (
                            <Menu.Item
                                key={key}
                                aria-label={t(`icons.${key}`)}
                                aria-current={key === value}
                                className={cn(ITEM, key === value && 'bg-accent-soft text-accent-strong')}
                                onSelect={(): void => {
                                    onChange(key);
                                }}
                            >
                                {createElement(categoryIcon(key), GLYPH_PROPS)}
                            </Menu.Item>
                        );
                    })}
                </Menu.Content>
            </Menu.Portal>
        </Menu.Root>
    );
}
