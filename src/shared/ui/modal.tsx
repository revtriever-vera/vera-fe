import { X } from 'lucide-react';
import { useEffect, useId, useRef, type ReactElement, type ReactNode, type RefObject } from 'react';
import { cn } from '@/shared/lib/cn';
import { type UiText, useUiText } from './ui-text';

interface ModalProps {
    readonly title: string;
    readonly description?: string;
    readonly onClose: () => void;
    readonly children: ReactNode;
    readonly footer: ReactNode;
    readonly size?: 'default' | 'wide';
    readonly leading?: ReactNode;
    readonly fullOnMobile?: boolean;
}

const FOCUSABLE: string =
    'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function focusableIn(container: HTMLElement): HTMLElement[] {
    return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE));
}

function trapTab(event: KeyboardEvent, dialog: HTMLElement | null): void {
    if (event.key !== 'Tab' || dialog === null) {
        return;
    }
    const items: HTMLElement[] = focusableIn(dialog);
    const first: HTMLElement | undefined = items[0];
    const last: HTMLElement | undefined = items[items.length - 1];
    const goingBack: boolean = event.shiftKey && (document.activeElement === first || document.activeElement === dialog);
    const goingOut: boolean = !event.shiftKey && document.activeElement === last;
    if (goingBack || goingOut) {
        event.preventDefault();
        (goingBack ? last : first)?.focus();
    }
}

function useInitialFocus(dialog: RefObject<HTMLDivElement | null>): void {
    useEffect((): (() => void) => {
        const previous: Element | null = document.activeElement;
        const node: HTMLDivElement | null = dialog.current;
        if (node !== null && !node.contains(document.activeElement)) {
            (focusableIn(node)[0] ?? node).focus();
        }
        return (): void => {
            if (previous instanceof HTMLElement && previous.isConnected) {
                previous.focus();
            }
        };
    }, [dialog]);
}

const WIDTH: Readonly<Record<'default' | 'wide', string>> = { default: 'max-w-lg', wide: 'max-w-4xl' };

function ModalHeader({
    titleId,
    title,
    description,
    leading,
    closeLabel,
    onClose
}: {
    readonly titleId: string;
    readonly title: string;
    readonly leading: ReactNode;
    readonly description: string | undefined;
    readonly closeLabel: string;
    readonly onClose: () => void;
}): ReactElement {
    return (
        <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-2">
            <div className="flex min-w-0 items-center gap-3">
                {leading}
                <div className="flex flex-col gap-1">
                    <h2 id={titleId} className="text-lg font-semibold tracking-tight text-content">
                        {title}
                    </h2>
                    {description ? <p className="text-sm text-content-muted">{description}</p> : null}
                </div>
            </div>
            <button
                type="button"
                aria-label={closeLabel}
                onClick={onClose}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-control text-content-muted transition-colors hover:bg-surface-muted hover:text-content"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}

function useKeyboard(onClose: () => void, dialog: RefObject<HTMLDivElement | null>): void {
    useEffect((): (() => void) => {
        const onKey = (event: KeyboardEvent): void => {
            if (event.key === 'Escape' && !event.defaultPrevented) {
                onClose();
            }
            trapTab(event, dialog.current);
        };
        window.addEventListener('keydown', onKey);
        return (): void => {
            window.removeEventListener('keydown', onKey);
        };
    }, [onClose, dialog]);
}

function panelClass(size: 'default' | 'wide', fullOnMobile: boolean): string {
    return cn(
        'relative flex w-full flex-col overflow-hidden border border-border bg-surface shadow-popover outline-none',
        WIDTH[size],
        fullOnMobile ? 'h-full rounded-none sm:h-auto sm:max-h-[90vh] sm:rounded-card' : 'max-h-[90vh] rounded-card'
    );
}

export function Modal({
    title,
    description,
    onClose,
    children,
    footer,
    size = 'default',
    leading,
    fullOnMobile = false
}: ModalProps): ReactElement {
    const t: UiText = useUiText();
    const titleId: string = useId();
    const dialog: RefObject<HTMLDivElement | null> = useRef<HTMLDivElement | null>(null);
    useInitialFocus(dialog);
    useKeyboard(onClose, dialog);

    return (
        <div className={cn('fixed inset-0 z-50 flex items-center justify-center', fullOnMobile ? 'p-0 sm:p-5' : 'p-5')}>
            <button type="button" aria-label={t.close} onClick={onClose} className="absolute inset-0 bg-black/50" />
            <div
                ref={dialog}
                role="dialog"
                aria-modal="true"
                tabIndex={-1}
                aria-labelledby={titleId}
                className={panelClass(size, fullOnMobile)}
            >
                <ModalHeader
                    titleId={titleId}
                    title={title}
                    description={description}
                    leading={leading}
                    closeLabel={t.close}
                    onClose={onClose}
                />
                <div className="flex-1 overflow-y-auto px-5 py-3">{children}</div>
                <div className="flex justify-end gap-2 border-t border-border px-5 py-4">{footer}</div>
            </div>
        </div>
    );
}
