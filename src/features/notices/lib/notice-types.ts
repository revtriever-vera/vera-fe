export const NOTICE_TYPE: {
    readonly goalBehind: 'goal_behind';
    readonly recurringWeek: 'recurring_week';
    readonly recurringDue: 'recurring_due';
} = {
    goalBehind: 'goal_behind',
    recurringWeek: 'recurring_week',
    recurringDue: 'recurring_due'
} as const;

export type KnownNoticeType = (typeof NOTICE_TYPE)[keyof typeof NOTICE_TYPE];

const KNOWN: ReadonlySet<string> = new Set<string>(Object.values(NOTICE_TYPE));

export function isKnownNoticeType(type: string): type is KnownNoticeType {
    return KNOWN.has(type);
}
