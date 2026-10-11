import { useEffect, useRef, useState, type RefObject } from 'react';
import { SEARCH_DEBOUNCE_MS } from './transaction-filters';

export interface SearchText {
    readonly text: string;
    readonly change: (value: string) => void;
    readonly reset: () => void;
}

type Timer = ReturnType<typeof setTimeout>;

export function useSearchText(initial: string, onCommit: (value: string) => void): SearchText {
    const [text, setText] = useState<string>(initial);
    const timer: RefObject<Timer | null> = useRef<Timer | null>(null);
    const latest: RefObject<(value: string) => void> = useRef<(value: string) => void>(onCommit);
    const cancel = (): void => {
        if (timer.current !== null) {
            clearTimeout(timer.current);
            timer.current = null;
        }
    };
    useEffect((): void => {
        latest.current = onCommit;
    });
    useEffect((): (() => void) => cancel, []);
    return {
        text,
        change: (value: string): void => {
            setText(value);
            cancel();
            timer.current = setTimeout((): void => {
                latest.current(value.trim());
            }, SEARCH_DEBOUNCE_MS);
        },
        reset: (): void => {
            cancel();
            setText('');
        }
    };
}
