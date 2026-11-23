export const membersKeys: {
    all: readonly ['members'];
    list: () => readonly ['members', 'list'];
} = {
    all: ['members'] as const,
    list: (): readonly ['members', 'list'] => [...membersKeys.all, 'list'] as const
};
