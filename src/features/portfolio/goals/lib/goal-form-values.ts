import type { SupportedLocale } from '@/shared/lib/locale';
import { bpsToInput } from '../../lib/parse-percent-input';
import { HOLDER_ALL, holderBody, holderValueOf } from '../../lib/holder-filter';
import type { PeopleState } from '../../lib/people-context';
import type { GoalFormInput } from '../schemas/goal.schema';
import {
    DEFAULT_RESERVE_MONTHS,
    GOAL_KIND,
    type CreateGoalBody,
    type GoalHoldingBody,
    type GoalHoldingView,
    type GoalKind,
    type GoalView,
    type UpdateGoalBody
} from '../types';
import { bodyHoldings, sameHoldings, sharesFromHoldings } from './goal-holdings';

const RESERVE_DEFAULT_MONTHS_AHEAD: number = 12;

export function addMonthsIso(today: string, months: number): string {
    const [year, month, day]: number[] = today.split('-').map(Number);
    const target: Date = new Date(Date.UTC(year ?? 1970, (month ?? 1) - 1 + months, 1));
    const lastDay: number = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
    const text = (value: number): string => String(value).padStart(2, '0');
    return `${String(target.getUTCFullYear())}-${text(target.getUTCMonth() + 1)}-${text(Math.min(day ?? 1, lastDay))}`;
}

export function emptyFormValues(kind: GoalKind, today: string, name: string): GoalFormInput {
    return {
        kind,
        name,
        targetMinor: null,
        targetDate: kind === GOAL_KIND.emergencyReserve ? addMonthsIso(today, RESERVE_DEFAULT_MONTHS_AHEAD) : null,
        manualMinor: null,
        holder: HOLDER_ALL,
        reserveMonths: DEFAULT_RESERVE_MONTHS,
        monthlySpend: null,
        shares: {}
    };
}

export function formValuesOf(goal: GoalView, locale: SupportedLocale): GoalFormInput {
    return {
        kind: goal.kind,
        name: goal.name,
        targetMinor: goal.targetMinor,
        targetDate: goal.targetDate,
        manualMinor: goal.manualMinor === 0 ? null : goal.manualMinor,
        holder: holderValueOf(goal.holderUserId),
        reserveMonths: goal.reserve?.months ?? DEFAULT_RESERVE_MONTHS,
        monthlySpend: null,
        shares: sharesFromHoldings(goal.holdings, (bps: number): string => bpsToInput(bps, locale))
    };
}

export function createBody(values: GoalFormInput, people: PeopleState, locale: SupportedLocale): CreateGoalBody {
    return {
        kind: values.kind,
        name: values.name.trim(),
        targetMinor: values.targetMinor ?? 0,
        targetDate: values.targetDate ?? '',
        manualMinor: values.manualMinor ?? 0,
        ...holderBody(values.holder, people.multi),
        ...(values.kind === GOAL_KIND.emergencyReserve ? { reserveMonths: values.reserveMonths } : {}),
        holdings: bodyHoldings(values.shares, locale)
    };
}

function scalarChanges(goal: GoalView, values: GoalFormInput): UpdateGoalBody {
    const name: string = values.name.trim();
    const manual: number = values.manualMinor ?? 0;
    return {
        ...(name === goal.name ? {} : { name }),
        ...(values.targetMinor === goal.targetMinor ? {} : { targetMinor: values.targetMinor ?? 0 }),
        ...(values.targetDate === goal.targetDate ? {} : { targetDate: values.targetDate ?? '' }),
        ...(manual === goal.manualMinor ? {} : { manualMinor: manual })
    };
}

function holderChange(goal: GoalView, values: GoalFormInput, people: PeopleState): UpdateGoalBody {
    return people.multi && values.holder !== holderValueOf(goal.holderUserId) ? holderBody(values.holder, people.multi) : {};
}

function holdingsChange(goal: GoalView, values: GoalFormInput, locale: SupportedLocale): UpdateGoalBody {
    const next: GoalHoldingBody[] = bodyHoldings(values.shares, locale);
    const current: GoalHoldingBody[] = goal.holdings
        .filter((item: GoalHoldingView): boolean => !item.removed)
        .map((item: GoalHoldingView): GoalHoldingBody => ({ kind: item.kind, holdingId: item.holdingId, shareBps: item.shareBps }));
    return sameHoldings(next, current) ? {} : { holdings: next };
}

function reserveChange(goal: GoalView, values: GoalFormInput): UpdateGoalBody {
    if (goal.kind !== GOAL_KIND.emergencyReserve) {
        return {};
    }
    const moved: boolean = goal.reserve === null ? values.targetMinor !== goal.targetMinor : goal.reserve.months !== values.reserveMonths;
    return moved ? { reserveMonths: values.reserveMonths } : {};
}

export function updateBody(goal: GoalView, values: GoalFormInput, people: PeopleState, locale: SupportedLocale): UpdateGoalBody {
    return {
        ...scalarChanges(goal, values),
        ...holderChange(goal, values, people),
        ...holdingsChange(goal, values, locale),
        ...reserveChange(goal, values)
    };
}

export function nextDayIso(today: string): string {
    const [year, month, day]: number[] = today.split('-').map(Number);
    const next: Date = new Date(Date.UTC(year ?? 1970, (month ?? 1) - 1, (day ?? 1) + 1));
    const text = (value: number): string => String(value).padStart(2, '0');
    return `${String(next.getUTCFullYear())}-${text(next.getUTCMonth() + 1)}-${text(next.getUTCDate())}`;
}
