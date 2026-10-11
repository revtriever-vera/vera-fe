import type { ConnectionStatus, SpendingConnectionsKey } from '../types';

export type HelpKey = 'banks.help.reconnect' | 'banks.help.confirm' | 'banks.help.reauthorize' | 'banks.help.paused';

export type HelpTarget =
    | { readonly kind: 'step'; readonly step: number; readonly label: SpendingConnectionsKey }
    | { readonly kind: 'rotate'; readonly label: SpendingConnectionsKey };

const ATTENTION_HELP: Readonly<Record<string, HelpKey>> = {
    waiting_user_input: 'banks.help.confirm',
    item_not_found: 'banks.help.reauthorize'
};

const TARGETS: Readonly<Record<HelpKey, HelpTarget>> = {
    'banks.help.reconnect': { kind: 'step', step: 2, label: 'banks.help.step2' },
    'banks.help.confirm': { kind: 'step', step: 2, label: 'banks.help.step2' },
    'banks.help.reauthorize': { kind: 'step', step: 4, label: 'banks.help.step4' },
    'banks.help.paused': { kind: 'rotate', label: 'banks.help.rotate' }
};

export function connectionHelpKey(status: ConnectionStatus, reason: string | null): HelpKey | null {
    if (status === 'paused') {
        return 'banks.help.paused';
    }
    if (status === 'revoked') {
        return 'banks.help.reauthorize';
    }
    if (status === 'needs_attention') {
        return ATTENTION_HELP[reason ?? ''] ?? 'banks.help.reconnect';
    }
    return null;
}

export function helpTarget(key: HelpKey): HelpTarget {
    return TARGETS[key];
}
