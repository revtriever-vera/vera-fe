const ANY_HOLDER: string = 'any';

export const agendaKeys: {
    all: readonly ['agenda'];
    window: (from: string, to: string, holder: string | undefined) => readonly ['agenda', string, string, string];
} = {
    all: ['agenda'] as const,
    window: (from: string, to: string, holder: string | undefined): readonly ['agenda', string, string, string] =>
        [...agendaKeys.all, from, to, holder ?? ANY_HOLDER] as const
};
