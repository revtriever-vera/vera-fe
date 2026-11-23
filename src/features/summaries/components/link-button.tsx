import type { ReactElement, ReactNode } from 'react';

export function LinkButton({ onClick, children }: { readonly onClick: () => void; readonly children: ReactNode }): ReactElement {
    return (
        <button type="button" onClick={onClick} className="font-semibold text-accent-strong underline underline-offset-2">
            {children}
        </button>
    );
}
