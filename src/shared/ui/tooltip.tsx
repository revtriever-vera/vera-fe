import { useState, type MouseEvent, type ReactElement, type ReactNode } from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';

export interface BalloonProps {
    readonly text: string;
    readonly children: ReactNode;
}

const BUBBLE: string =
    'z-[60] max-w-[220px] rounded-control bg-content px-2.5 py-1.5 text-2xs leading-snug text-surface shadow-lg balloon-in';

export function Balloon({ text, children }: BalloonProps): ReactElement {
    return (
        <Tooltip.Provider delayDuration={150}>
            <Tooltip.Root>
                <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
                <Tooltip.Portal>
                    <Tooltip.Content side="top" align="center" sideOffset={6} className={BUBBLE} role="tooltip">
                        {text}
                        <Tooltip.Arrow className="fill-content" width={10} height={5} />
                    </Tooltip.Content>
                </Tooltip.Portal>
            </Tooltip.Root>
        </Tooltip.Provider>
    );
}

export interface RichBalloonProps {
    readonly content: ReactNode;
    readonly children: ReactNode;
    readonly label?: string;
}

const RICH_BUBBLE: string =
    'z-[60] max-w-[280px] rounded-control bg-content px-3 py-2 text-2xs leading-snug text-surface shadow-lg balloon-in';

export function RichBalloon({ content, children, label }: RichBalloonProps): ReactElement {
    const [open, setOpen] = useState<boolean>(false);
    const openOnTouch = (event: MouseEvent<HTMLElement>): void => {
        event.preventDefault();
        setOpen(true);
    };
    return (
        <Tooltip.Provider delayDuration={150}>
            <Tooltip.Root open={open} onOpenChange={setOpen}>
                <Tooltip.Trigger asChild onClick={openOnTouch}>
                    {children}
                </Tooltip.Trigger>
                <Tooltip.Portal>
                    <Tooltip.Content side="top" align="center" sideOffset={6} className={RICH_BUBBLE} role="tooltip" aria-label={label}>
                        {content}
                        <Tooltip.Arrow className="fill-content" width={10} height={5} />
                    </Tooltip.Content>
                </Tooltip.Portal>
            </Tooltip.Root>
        </Tooltip.Provider>
    );
}
