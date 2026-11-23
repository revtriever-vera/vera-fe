import { useBilling } from '@/shared/lib/billing/use-billing';

/** Na auto-hospedada quem recebe os totais é o modelo que a pessoa cadastrou, então o aviso não cita a Vercel nem o treino do provedor. */
export function useNoticeSuffix(): '' | 'SelfHosted' {
    return useBilling().mode === 'self_hosted' ? 'SelfHosted' : '';
}
