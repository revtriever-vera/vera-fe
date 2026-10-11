import {
    createContext,
    use,
    useCallback,
    useMemo,
    useRef,
    useState,
    type Context,
    type ReactElement,
    type ReactNode,
    type RefObject
} from 'react';
import { ToastStack } from '@/shared/ui/toast';
import { TOAST_DURATIONS_MS, TOAST_STACK_LIMIT, type Toast, type ToastRequest } from '@/shared/ui/toast.types';

export interface ToastApi {
    readonly toasts: readonly Toast[];
    readonly show: (request: ToastRequest) => void;
    readonly dismiss: (id: string) => void;
}

const ToastContext: Context<ToastApi | null> = createContext<ToastApi | null>(null);

export function ToastProvider({ children }: { readonly children: ReactNode }): ReactElement {
    const [toasts, setToasts] = useState<readonly Toast[]>([]);
    const sequence: RefObject<number> = useRef<number>(0);

    const dismiss: ToastApi['dismiss'] = useCallback((id: string): void => {
        setToasts((current: readonly Toast[]): readonly Toast[] => current.filter((toast: Toast): boolean => toast.id !== id));
    }, []);

    const show: ToastApi['show'] = useCallback((request: ToastRequest): void => {
        sequence.current += 1;
        const next: Toast = {
            id: `toast-${String(sequence.current)}`,
            tone: request.tone,
            title: request.title,
            detail: request.detail ?? null,
            durationMs: request.durationMs ?? TOAST_DURATIONS_MS[request.tone]
        };
        setToasts((current: readonly Toast[]): readonly Toast[] => [...current, next].slice(-TOAST_STACK_LIMIT));
    }, []);

    const value: ToastApi = useMemo<ToastApi>((): ToastApi => ({ toasts, show, dismiss }), [toasts, show, dismiss]);

    return (
        <ToastContext value={value}>
            {children}
            <ToastStack toasts={toasts} onDismiss={dismiss} />
        </ToastContext>
    );
}

export function useToast(): ToastApi {
    const context: ToastApi | null = use(ToastContext);
    if (context === null) {
        throw new Error('useToast must be used inside ToastProvider');
    }
    return context;
}
