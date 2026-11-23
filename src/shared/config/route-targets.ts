const ADMIN_FILES: string = 'admin|_platform';

/**
 * Padrão de arquivos de rota que o gerador do roteador ignora em cada alvo de build. O alvo `tenant` tira o admin (`admin.*` e o
 * layout `_platform`); o alvo `admin` tira o resto, menos o root. Sem imports: o `vite.config.ts` carrega este arquivo direto.
 */
export function routeFileIgnorePatternFor(target: string): string | undefined {
    if (target === 'tenant') {
        return ADMIN_FILES;
    }
    if (target === 'admin') {
        return `^(?!${ADMIN_FILES}|__root)`;
    }
    return undefined;
}
