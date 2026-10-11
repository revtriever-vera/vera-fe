import { Search } from 'lucide-react';
import type { ReactElement } from 'react';
import { cn } from '@/shared/lib/cn';

export interface SearchInputProps {
    readonly value: string;
    readonly onChange: (value: string) => void;
    readonly placeholder: string;
    readonly label: string;
    readonly className?: string;
    readonly combobox?: SearchComboboxProps;
}

export interface SearchComboboxProps {
    readonly listId: string;
    readonly activeId: string | undefined;
}

export function SearchInput({ value, onChange, placeholder, label, className, combobox }: SearchInputProps): ReactElement {
    return (
        <div className={cn('relative', className)}>
            <input
                type="search"
                value={value}
                onChange={(event): void => {
                    onChange(event.target.value);
                }}
                placeholder={placeholder}
                aria-label={label}
                role={combobox === undefined ? undefined : 'combobox'}
                aria-expanded={combobox === undefined ? undefined : true}
                aria-controls={combobox?.listId}
                aria-activedescendant={combobox?.activeId}
                aria-autocomplete={combobox === undefined ? undefined : 'list'}
                className="w-full rounded-full border border-border bg-surface-muted py-2.5 pr-4 pl-10 text-sm text-content transition outline-none placeholder:text-content-subtle focus:border-accent focus:bg-surface focus:ring-4 focus:ring-accent/10 [&::-webkit-search-cancel-button]:hidden"
            />
            <Search
                className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-content-subtle"
                aria-hidden="true"
            />
        </div>
    );
}
