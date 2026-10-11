import { useEffect, useRef, type ReactElement, type ReactNode, type RefObject } from 'react';

export function StepHeading({ children }: { readonly children: ReactNode }): ReactElement {
    const ref: RefObject<HTMLHeadingElement | null> = useRef<HTMLHeadingElement>(null);

    useEffect((): void => {
        ref.current?.focus();
    }, []);

    return (
        <h1
            ref={ref}
            tabIndex={-1}
            className="my-3.5 font-display text-[clamp(30px,4.2vw,46px)] leading-[1.03] font-bold tracking-[-0.035em] text-balance text-content outline-none"
        >
            {children}
        </h1>
    );
}
