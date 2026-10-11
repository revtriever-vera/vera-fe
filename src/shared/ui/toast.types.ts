export const TOAST_TONES = {
    positive: 'positive',
    caution: 'caution',
    critical: 'critical',
    neutral: 'neutral'
} as const;

export type ToastTone = (typeof TOAST_TONES)[keyof typeof TOAST_TONES];

export const TOAST_DURATIONS_MS: Record<ToastTone, number> = {
    positive: 3200,
    neutral: 4000,
    caution: 6000,
    critical: 0
};

export const TOAST_STACK_LIMIT: number = 3;

export interface Toast {
    readonly id: string;
    readonly tone: ToastTone;
    readonly title: string;
    readonly detail: string | null;
    readonly durationMs: number;
}

export interface ToastRequest {
    readonly tone: ToastTone;
    readonly title: string;
    readonly detail?: string;
    readonly durationMs?: number;
}
