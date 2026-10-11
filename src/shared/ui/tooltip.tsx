import type { ReactElement, ReactNode } from 'react';
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
