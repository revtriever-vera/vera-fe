import { createContext, use, type Context } from 'react';

export interface SampleDataControls {
    readonly available: boolean;
    readonly active: boolean;
    readonly isLoading: boolean;
    readonly load: () => Promise<void>;
    readonly clear: () => Promise<void>;
}

export const SampleDataContext: Context<SampleDataControls | null> = createContext<SampleDataControls | null>(null);

export function useSampleData(): SampleDataControls {
    const controls: SampleDataControls | null = use(SampleDataContext);
    if (controls === null) {
        throw new Error('useSampleData must be used inside SampleDataProvider');
    }
    return controls;
}
