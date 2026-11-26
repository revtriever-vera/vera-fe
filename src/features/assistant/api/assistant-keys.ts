export const assistantKeys: {
    all: readonly ['assistant'];
    conversation: () => readonly ['assistant', 'conversation'];
    turn: (id: string) => readonly ['assistant', 'turn', string];
    sent: (id: string) => readonly ['assistant', 'turn', string, 'sent'];
    action: (id: string) => readonly ['assistant', 'action', string];
} = {
    all: ['assistant'] as const,
    conversation: (): readonly ['assistant', 'conversation'] => [...assistantKeys.all, 'conversation'] as const,
    turn: (id: string): readonly ['assistant', 'turn', string] => [...assistantKeys.all, 'turn', id] as const,
    sent: (id: string): readonly ['assistant', 'turn', string, 'sent'] => [...assistantKeys.all, 'turn', id, 'sent'] as const,
    action: (id: string): readonly ['assistant', 'action', string] => [...assistantKeys.all, 'action', id] as const
};
