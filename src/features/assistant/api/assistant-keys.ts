export const assistantKeys: {
    all: readonly ['assistant'];
    conversation: () => readonly ['assistant', 'conversation'];
    turn: (id: string) => readonly ['assistant', 'turn', string];
} = {
    all: ['assistant'] as const,
    conversation: (): readonly ['assistant', 'conversation'] => [...assistantKeys.all, 'conversation'] as const,
    turn: (id: string): readonly ['assistant', 'turn', string] => [...assistantKeys.all, 'turn', id] as const
};
