import { useLayoutEffect, useState, type RefObject } from 'react';

export function useElementWidth(target: RefObject<HTMLElement | null>): number {
    const [width, setWidth] = useState<number>(0);
    useLayoutEffect((): (() => void) => {
        const element: HTMLElement | null = target.current;
        if (element === null) {
            return (): void => undefined;
        }
        const measure = (): void => {
            setWidth(Math.round(element.clientWidth));
        };
        measure();
        const observer: ResizeObserver = new ResizeObserver(measure);
        observer.observe(element);
        return (): void => {
            observer.disconnect();
        };
    }, [target]);
    return width;
}
