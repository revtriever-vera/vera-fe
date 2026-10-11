import type { PluggyTarget } from '@/shared/lib/pluggy-links';
import type { SpendingConnectionsKey } from '../types';

export interface TutorialStepDefinition {
    readonly step: number;
    readonly title: SpendingConnectionsKey;
    readonly lines: readonly SpendingConnectionsKey[];
    readonly link: Exclude<PluggyTarget, 'github'> | null;
    readonly warning: SpendingConnectionsKey | null;
}

export const TUTORIAL_STEPS: readonly TutorialStepDefinition[] = [
    { step: 1, title: 'tutorial.s1.title', lines: ['tutorial.s1.line1'], link: 'meu', warning: null },
    {
        step: 2,
        title: 'tutorial.s2.title',
        lines: ['tutorial.s2.line1', 'tutorial.s2.line2', 'tutorial.s2.line3'],
        link: 'meu',
        warning: null
    },
    {
        step: 3,
        title: 'tutorial.s3.title',
        lines: ['tutorial.s3.line1', 'tutorial.s3.line2', 'tutorial.s3.line3'],
        link: 'dashboard',
        warning: 'tutorial.s3.warn'
    },
    {
        step: 4,
        title: 'tutorial.s4.title',
        lines: ['tutorial.s4.line1', 'tutorial.s4.line2', 'tutorial.s4.line3'],
        link: 'dashboard',
        warning: null
    },
    { step: 5, title: 'tutorial.s5.title', lines: ['tutorial.s5.line1', 'tutorial.s5.line2'], link: null, warning: null },
    { step: 6, title: 'tutorial.s6.title', lines: ['tutorial.s6.line1'], link: null, warning: null }
];
