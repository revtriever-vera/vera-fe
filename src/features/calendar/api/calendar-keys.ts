export const calendarKeys: {
    all: readonly ['calendar'];
    connection: () => readonly ['calendar', 'connection'];
    events: () => readonly ['calendar', 'events'];
} = {
    all: ['calendar'] as const,
    connection: (): readonly ['calendar', 'connection'] => [...calendarKeys.all, 'connection'] as const,
    events: (): readonly ['calendar', 'events'] => [...calendarKeys.all, 'events'] as const
};
