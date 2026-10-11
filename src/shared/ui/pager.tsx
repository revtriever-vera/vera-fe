import type { ReactElement } from 'react';
import { type UiText, useUiText } from './ui-text';

const BUTTON_CLASS: string = 'rounded-control border border-border px-2.5 py-1 transition hover:border-border-strong disabled:opacity-40';

export interface PagerProps {
    readonly page: number;
    readonly totalPages: number;
    readonly onChange: (page: number) => void;
}

export function Pager({ page, totalPages, onChange }: PagerProps): ReactElement | null {
    const t: UiText = useUiText();

    if (totalPages <= 1) {
        return null;
    }

    return (
        <div className="flex items-center gap-2">
            <button
                type="button"
                disabled={page === 1}
                onClick={(): void => {
                    onChange(page - 1);
                }}
                className={BUTTON_CLASS}
            >
                {t.previous}
            </button>
            <span className="tabular-nums">
                {page} / {totalPages}
            </span>
            <button
                type="button"
                disabled={page === totalPages}
                onClick={(): void => {
                    onChange(page + 1);
                }}
                className={BUTTON_CLASS}
            >
                {t.next}
            </button>
        </div>
    );
}
