import { Search } from 'lucide-react';
import type { ReactElement } from 'react';
import { cn } from '@/shared/lib/cn';

export interface SearchInputProps {
    readonly value: string;
    readonly onChange: (value: string) => void;
    readonly placeholder: string;
    readonly label: string;
    readonly className?: string;
}

export function SearchInput({ value, onChange, placeholder, label, className }: SearchInputProps): ReactElement {
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
                className="w-full rounded-full border border-border bg-surface-muted py-2.5 pr-4 pl-10 text-sm text-content transition outline-none placeholder:text-content-subtle focus:border-accent focus:bg-surface focus:ring-4 focus:ring-accent/10 [&::-webkit-search-cancel-button]:hidden"
            />
            <Search
                className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-content-subtle"
                aria-hidden="true"
            />
        </div>
    );
}
