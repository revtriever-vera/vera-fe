export const integrationsKeys: {
    all: readonly ['integrations'];
    list: () => readonly ['integrations', 'list'];
} = {
    all: ['integrations'] as const,
    list: (): readonly ['integrations', 'list'] => [...integrationsKeys.all, 'list'] as const
};
