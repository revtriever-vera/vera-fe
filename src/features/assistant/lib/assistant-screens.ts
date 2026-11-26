export type AssistantScreen =
    'portfolio' | 'targets' | 'contribution' | 'goals' | 'assets' | 'spending' | 'transactions' | 'recurring' | 'cuts' | 'other';

export type SuggestionKey = `suggestions.${AssistantScreen}.${'one' | 'two' | 'three'}`;

const SCREEN_PREFIXES: readonly (readonly [string, AssistantScreen])[] = [
    ['/portfolio/targets', 'targets'],
    ['/portfolio/contribution', 'contribution'],
    ['/portfolio/goals', 'goals'],
    ['/portfolio/assets', 'assets'],
    ['/portfolio', 'portfolio'],
    ['/spending/transactions', 'transactions'],
    ['/spending/recurring', 'recurring'],
    ['/spending/cuts', 'cuts'],
    ['/spending', 'spending']
];

function matchesPrefix(pathname: string, prefix: string): boolean {
    return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function screenOf(pathname: string): AssistantScreen {
    const match: readonly [string, AssistantScreen] | undefined = SCREEN_PREFIXES.find(
        ([prefix]: readonly [string, AssistantScreen]): boolean => matchesPrefix(pathname, prefix)
    );
    return match === undefined ? 'other' : match[1];
}

export function suggestionKeys(screen: AssistantScreen): readonly SuggestionKey[] {
    return [`suggestions.${screen}.one`, `suggestions.${screen}.two`, `suggestions.${screen}.three`];
}
