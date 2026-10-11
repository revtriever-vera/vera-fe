import { X } from 'lucide-react';
import { useEffect, useRef, type ReactElement, type ReactNode, type RefObject } from 'react';
import { type UiText, useUiText } from './ui-text';

interface ModalProps {
    readonly title: string;
    readonly description?: string;
    readonly onClose: () => void;
    readonly children: ReactNode;
    readonly footer: ReactNode;
    readonly size?: 'default' | 'wide';
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
    title,
    description,
    closeLabel,
    onClose
}: {
    readonly title: string;
    readonly description: string | undefined;
    readonly closeLabel: string;
    readonly onClose: () => void;
}): ReactElement {
    return (
        <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-2">
            <div className="flex flex-col gap-1">
                <h2 className="text-lg font-semibold tracking-tight text-content">{title}</h2>
                {description ? <p className="text-sm text-content-muted">{description}</p> : null}
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

export function Modal({ title, description, onClose, children, footer, size = 'default' }: ModalProps): ReactElement {
    const t: UiText = useUiText();
    const dialog: RefObject<HTMLDivElement | null> = useRef<HTMLDivElement | null>(null);
    useInitialFocus(dialog);

    useEffect((): (() => void) => {
        const onKey = (event: KeyboardEvent): void => {
            if (event.key === 'Escape') {
                onClose();
            }
            trapTab(event, dialog.current);
        };
        window.addEventListener('keydown', onKey);
        return (): void => {
            window.removeEventListener('keydown', onKey);
        };
    }, [onClose, dialog]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
            <button type="button" aria-label={t.close} onClick={onClose} className="absolute inset-0 bg-black/50" />
            <div
                ref={dialog}
                role="dialog"
                aria-modal="true"
                tabIndex={-1}
                aria-label={title}
                className={`relative flex max-h-[90vh] w-full ${WIDTH[size]} flex-col overflow-hidden outline-none rounded-card border border-border bg-surface shadow-popover`}
            >
                <ModalHeader title={title} description={description} closeLabel={t.close} onClose={onClose} />
                <div className="flex-1 overflow-y-auto px-5 py-3">{children}</div>
                <div className="flex justify-end gap-2 border-t border-border px-5 py-4">{footer}</div>
            </div>
        </div>
    );
}
