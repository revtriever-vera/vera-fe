const ANY_HOLDER: string = 'any';

export const goalsKeys: {
    all: readonly ['goals'];
    list: () => readonly ['goals', 'list'];
    listOf: (holder: string | undefined) => readonly ['goals', 'list', string];
} = {
    all: ['goals'] as const,
    list: (): readonly ['goals', 'list'] => [...goalsKeys.all, 'list'] as const,
    listOf: (holder: string | undefined): readonly ['goals', 'list', string] => [...goalsKeys.list(), holder ?? ANY_HOLDER] as const
};
