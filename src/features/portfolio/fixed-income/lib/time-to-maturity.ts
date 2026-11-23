import { MATURITY_ATTENTION_DAYS, MATURITY_REALLOCATE_DAYS } from '../types';

const MAX_DAYS_AS_DAYS: number = MATURITY_ATTENTION_DAYS;
const MAX_DAYS_AS_MONTHS: number = 730;
const DAYS_PER_MONTH: number = 30.4;
const DAYS_PER_YEAR: number = 365.25;
const MIN_ANTICIPATION_DAYS: number = 0;

export const TIME_UNIT = {
    today: 'today',
    days: 'days',
    months: 'months',
    years: 'years'
} as const;

export type TimeUnit = (typeof TIME_UNIT)[keyof typeof TIME_UNIT];

export interface TimeToMaturity {
    readonly unit: TimeUnit;
    readonly amount: number;
}

export function timeToMaturity(days: number): TimeToMaturity {
    if (days <= MIN_ANTICIPATION_DAYS) {
        return { unit: TIME_UNIT.today, amount: 0 };
    }
    if (days <= MAX_DAYS_AS_DAYS) {
        return { unit: TIME_UNIT.days, amount: days };
    }
    if (days < MAX_DAYS_AS_MONTHS) {
        return { unit: TIME_UNIT.months, amount: Math.round(days / DAYS_PER_MONTH) };
    }
    return { unit: TIME_UNIT.years, amount: Math.round((days / DAYS_PER_YEAR) * 10) / 10 };
}

export const DAYS_BUCKET = {
    attention: 'up_to_60',
    soon: 'up_to_90',
    later: 'over_90'
} as const;

export type DaysBucket = (typeof DAYS_BUCKET)[keyof typeof DAYS_BUCKET];

export function daysBucket(days: number): DaysBucket {
    if (days <= MAX_DAYS_AS_DAYS) {
        return DAYS_BUCKET.attention;
    }
    return days <= MATURITY_REALLOCATE_DAYS ? DAYS_BUCKET.soon : DAYS_BUCKET.later;
}
