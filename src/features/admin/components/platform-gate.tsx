import type { ReactElement, ReactNode } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { Alert } from '@/shared/ui/alert';
import type { AuditList } from '../types';
import { useAudit } from '../api/use-audit.query';
import { platformRefusal, type PlatformRefusal } from '../lib/platform-refusal';

/**
 * A sessão do app das contas e a do admin vêm do mesmo cookie de renovação: quem abre o admin com uma sessão de conta comum
 * passa pelo login mas leva 403 na primeira rota `/platform`. A trilha de auditoria (cache compartilhado com a tela de
 * Auditoria) é a sonda: a recusa troca todo o conteúdo por um aviso.
 */
export function PlatformGate({ children }: { readonly children: ReactNode }): ReactElement {
    const { t }: UseTranslationResponse<'admin', undefined> = useTranslation('admin');
    const audit: UseQueryResult<AuditList> = useAudit();
    const refusal: PlatformRefusal | null = platformRefusal(audit.error);
    if (refusal === null) {
        return <>{children}</>;
    }
    return (
        <div className="px-page-x py-6">
            <Alert
                title={t(refusal === 'denied' ? 'deniedTitle' : 'disabledTitle')}
                detail={t(refusal === 'denied' ? 'deniedDetail' : 'disabledDetail')}
            />
        </div>
    );
}
