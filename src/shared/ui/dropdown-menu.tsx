import * as Menu from '@radix-ui/react-dropdown-menu';
import type { ReactElement } from 'react';

export interface DropdownItem {
    readonly key: string;
    readonly label: string;
    readonly onSelect: () => void;
}

export interface DropdownMenuProps {
    readonly label: string;
    readonly trigger: ReactElement;
    readonly items: readonly DropdownItem[];
}

const CONTENT: string = 'z-50 min-w-40 rounded-control border border-border bg-surface p-1 shadow-lg';
const ITEM: string =
    'flex cursor-pointer items-center gap-2 rounded-control px-3 py-2 text-sm text-content outline-none data-[highlighted]:bg-surface-muted';

export function DropdownMenu({ label, trigger, items }: DropdownMenuProps): ReactElement {
    return (
        <Menu.Root>
            <Menu.Trigger asChild>{trigger}</Menu.Trigger>
            <Menu.Portal>
                <Menu.Content align="end" sideOffset={4} aria-label={label} className={CONTENT}>
                    {items.map((item: DropdownItem): ReactElement => (
                        <Menu.Item key={item.key} className={ITEM} onSelect={item.onSelect}>
                            {item.label}
                        </Menu.Item>
                    ))}
                </Menu.Content>
            </Menu.Portal>
        </Menu.Root>
    );
}
