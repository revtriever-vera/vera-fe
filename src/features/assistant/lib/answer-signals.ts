import type { MessageView } from '../types';

const HELP_TOOLS: ReadonlySet<string> = new Set<string>(['help_search', 'where_is']);
const PLAN_LINK: string = '(/settings/plan)';

export function usedAccountData(message: Pick<MessageView, 'toolsUsed'>): boolean {
    return message.toolsUsed.some((tool: string): boolean => !HELP_TOOLS.has(tool));
}

export function asksForPremium(message: Pick<MessageView, 'text' | 'toolsUsed'>): boolean {
    return !usedAccountData(message) && message.text.includes(PLAN_LINK);
}
