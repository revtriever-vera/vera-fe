import { useEffect, useRef, useState, type ReactElement, type RefObject } from 'react';
import { useRouterState } from '@tanstack/react-router';
import { Menu, X } from 'lucide-react';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { BrandLogo } from '@/shared/ui/brand-logo';
import { SidebarContent, type SidebarContentProps } from './sidebar';

const FOCUSABLE: string = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

function trapTab(event: globalThis.KeyboardEvent, panel: HTMLElement): void {
    const nodes: HTMLElement[] = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
    const first: HTMLElement | undefined = nodes[0];
    const last: HTMLElement | undefined = nodes[nodes.length - 1];
    if (first === undefined || last === undefined) {
        return;
    }
    if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
        return;
    }
    if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
    }
}

function useDrawerBehavior(panelRef: RefObject<HTMLDivElement | null>, onClose: () => void): void {
    const pathname: string = useRouterState({ select: (state): string => state.location.pathname });
    const opened: RefObject<string> = useRef<string>(pathname);

    useEffect((): (() => void) => {
        panelRef.current?.focus();
        const onKey = (event: globalThis.KeyboardEvent): void => {
            if (event.key === 'Escape') {
                onClose();
                return;
            }
            if (event.key === 'Tab' && panelRef.current !== null) {
                trapTab(event, panelRef.current);
            }
        };
        window.addEventListener('keydown', onKey);
        return (): void => {
            window.removeEventListener('keydown', onKey);
        };
    }, [panelRef, onClose]);

    useEffect((): void => {
        if (pathname !== opened.current) {
            onClose();
        }
    }, [pathname, onClose]);
}

interface DrawerProps extends SidebarContentProps {
    readonly onClose: () => void;
}

function Drawer({ items, topSlot, onClose }: DrawerProps): ReactElement {
    const { t }: UseTranslationResponse<'common', undefined> = useTranslation();
    const panelRef: RefObject<HTMLDivElement | null> = useRef<HTMLDivElement>(null);
    useDrawerBehavior(panelRef, onClose);

    return (
        <div className="fixed inset-0 z-50 min-[861px]:hidden">
            <button type="button" aria-label={t('closeMenu')} tabIndex={-1} onClick={onClose} className="absolute inset-0 bg-black/50" />
            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-label={t('navLabel')}
                tabIndex={-1}
                className="relative h-full w-[min(86vw,320px)] overflow-y-auto border-r border-border bg-surface px-3.5 py-5 pt-[max(1.25rem,env(safe-area-inset-top))] shadow-popover outline-none"
            >
                <button
                    type="button"
                    aria-label={t('closeMenu')}
                    onClick={onClose}
                    className="absolute top-3 right-3 grid size-11 place-items-center rounded-control text-content-muted hover:bg-surface-muted hover:text-content"
                >
                    <X className="size-5" aria-hidden="true" />
                </button>
                <SidebarContent items={items} topSlot={topSlot} />
            </div>
        </div>
    );
}

export function MobileTopBar(props: SidebarContentProps): ReactElement {
    const { t }: UseTranslationResponse<'common', undefined> = useTranslation();
    const [open, setOpen] = useState<boolean>(false);
    const triggerRef: RefObject<HTMLButtonElement | null> = useRef<HTMLButtonElement>(null);

    const close = (): void => {
        setOpen(false);
        triggerRef.current?.focus();
    };

    return (
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-surface px-4 py-2 pt-[max(0.5rem,env(safe-area-inset-top))] min-[861px]:hidden">
            <BrandLogo />
            <button
                ref={triggerRef}
                type="button"
                aria-label={t('openMenu')}
                aria-expanded={open}
                onClick={(): void => {
                    setOpen(true);
                }}
                className="grid size-11 place-items-center rounded-control text-content hover:bg-surface-muted"
            >
                <Menu className="size-5" aria-hidden="true" />
            </button>
            {open ? <Drawer {...props} onClose={close} /> : null}
        </header>
    );
}
