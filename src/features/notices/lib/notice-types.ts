export const NOTICE_TYPE: {
    readonly goalBehind: 'goal_behind';
    readonly recurringWeek: 'recurring_week';
    readonly recurringDue: 'recurring_due';
    readonly portfolioExDateTomorrow: 'portfolio_ex_date_tomorrow';
    readonly portfolioPaymentToday: 'portfolio_payment_today';
    readonly portfolioAssemblySoon: 'portfolio_assembly_soon';
    readonly fixedIncomeMaturitySoon: 'fixed_income_maturity_soon';
    readonly portfolioWeeklyChanges: 'portfolio_weekly_changes';
    readonly portfolioMonthlyReview: 'portfolio_monthly_review';
} = {
    goalBehind: 'goal_behind',
    recurringWeek: 'recurring_week',
    recurringDue: 'recurring_due',
    portfolioExDateTomorrow: 'portfolio_ex_date_tomorrow',
    portfolioPaymentToday: 'portfolio_payment_today',
    portfolioAssemblySoon: 'portfolio_assembly_soon',
    fixedIncomeMaturitySoon: 'fixed_income_maturity_soon',
    portfolioWeeklyChanges: 'portfolio_weekly_changes',
    portfolioMonthlyReview: 'portfolio_monthly_review'
} as const;

export type KnownNoticeType = (typeof NOTICE_TYPE)[keyof typeof NOTICE_TYPE];

const KNOWN: ReadonlySet<string> = new Set<string>(Object.values(NOTICE_TYPE));

export function isKnownNoticeType(type: string): type is KnownNoticeType {
    return KNOWN.has(type);
}
