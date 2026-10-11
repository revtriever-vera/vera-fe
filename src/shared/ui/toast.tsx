import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type ReactElement, type RefObject } from 'react';
import { cn } from '@/shared/lib/cn';
import { TOAST_TONES, type Toast, type ToastTone } from './toast.types';
import { type UiText, useUiText } from './ui-text';

const EXIT_MS: number = 140;

const SURFACES: Record<ToastTone, string> = {
    positive: 'border-positive/30 bg-positive-soft',
    caution: 'border-caution/30 bg-caution-soft',
    critical: 'border-critical/30 bg-critical-soft',
    neutral: 'border-info/30 bg-info-soft'
};

const MARKS: Record<ToastTone, string> = {
    positive: 'text-positive',
    caution: 'text-caution',
    critical: 'text-critical',
    neutral: 'text-info'
};

const LIFE_BARS: Record<ToastTone, string> = {
    positive: 'bg-positive',
    caution: 'bg-caution',
    critical: 'bg-critical',
    neutral: 'bg-info'
};

function ToastMark({ tone }: { readonly tone: ToastTone }): ReactElement {
    if (tone === TOAST_TONES.positive) {
        return <CheckCircle2 className={cn('mt-0.5 h-4 w-4 shrink-0', MARKS[tone])} aria-hidden />;
    }
    if (tone === TOAST_TONES.neutral) {
        return <Info className={cn('mt-0.5 h-4 w-4 shrink-0', MARKS[tone])} aria-hidden />;
    }
    return <AlertTriangle className={cn('mt-0.5 h-4 w-4 shrink-0', MARKS[tone])} aria-hidden />;
}

export interface Countdown {
    readonly hold: () => void;
    readonly release: () => void;
}

function useCountdown(durationMs: number, onElapsed: () => void): Countdown {
    const remaining: RefObject<number> = useRef<number>(durationMs);
    const startedAt: RefObject<number> = useRef<number>(0);
    const timer: RefObject<number | null> = useRef<number | null>(null);

    const stop: () => void = useCallback((): void => {
        if (timer.current !== null) {
            window.clearTimeout(timer.current);
            timer.current = null;
        }
    }, []);

    const start: () => void = useCallback((): void => {
        if (remaining.current <= 0) {
            return;
        }
        startedAt.current = Date.now();
        timer.current = window.setTimeout(onElapsed, remaining.current);
    }, [onElapsed]);

    useEffect((): (() => void) => {
        start();
        return stop;
    }, [start, stop]);

    const hold: () => void = useCallback((): void => {
        stop();
        remaining.current -= Date.now() - startedAt.current;
    }, [stop]);

    return { hold, release: start };
}

function DismissButton({ onClick }: { readonly onClick: () => void }): ReactElement {
    const t: UiText = useUiText();
    return (
        <button
            type="button"
            aria-label={t.dismissAlert}
            onClick={onClick}
            className="ml-auto inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-control text-content-muted transition-colors hover:bg-surface-muted hover:text-content"
        >
            <X className="h-3.5 w-3.5" />
        </button>
    );
}

function LifeBar({ tone, durationMs }: { readonly tone: ToastTone; readonly durationMs: number }): ReactElement | null {
    if (durationMs <= 0) {
        return null;
    }
    return (
        <span
            aria-hidden
            data-testid="toast-life"
            style={{ animationDuration: `${String(durationMs)}ms` }}
            className={cn('toast-life absolute inset-x-0 bottom-0 h-0.5 origin-left opacity-55', LIFE_BARS[tone])}
        />
    );
}

export interface ToastCardProps {
    readonly toast: Toast;
    readonly onDismiss: (id: string) => void;
}

export function ToastCard({ toast, onDismiss }: ToastCardProps): ReactElement {
    const [leaving, setLeaving] = useState<boolean>(false);
    const leave: () => void = useCallback((): void => {
        setLeaving(true);
    }, []);
    const { hold, release }: Countdown = useCountdown(toast.durationMs, leave);

    useEffect((): undefined | (() => void) => {
        if (!leaving) {
            return undefined;
        }
        const timer: number = window.setTimeout((): void => {
            onDismiss(toast.id);
        }, EXIT_MS);
        return (): void => {
            window.clearTimeout(timer);
        };
    }, [leaving, onDismiss, toast.id]);

    return (
        <div
            role={toast.tone === TOAST_TONES.critical ? 'alert' : 'status'}
            onMouseEnter={hold}
            onMouseLeave={release}
            onFocus={hold}
            onBlur={release}
            className={cn(
                'toast-card pointer-events-auto relative flex items-start gap-3 overflow-hidden rounded-card border p-3 shadow-popover',
                leaving ? 'toast-out' : 'toast-in',
                SURFACES[toast.tone]
            )}
        >
            <ToastMark tone={toast.tone} />
            <div className="flex min-w-0 flex-col gap-0.5">
                <span className="text-sm font-medium text-content">{toast.title}</span>
                {toast.detail ? <span className="text-xs text-content-muted">{toast.detail}</span> : null}
            </div>
            <DismissButton onClick={leave} />
            <LifeBar tone={toast.tone} durationMs={toast.durationMs} />
        </div>
    );
}

export interface ToastStackProps {
    readonly toasts: readonly Toast[];
    readonly onDismiss: (id: string) => void;
}

export function ToastStack({ toasts, onDismiss }: ToastStackProps): ReactElement | null {
    if (toasts.length === 0) {
        return null;
    }
    return (
        <div className="pointer-events-none fixed inset-x-4 top-4 z-50 flex flex-col gap-2 sm:top-5 sm:right-5 sm:left-auto sm:w-80">
            {toasts.map((toast: Toast): ReactElement => (
                <ToastCard key={toast.id} toast={toast} onDismiss={onDismiss} />
            ))}
        </div>
    );
}
