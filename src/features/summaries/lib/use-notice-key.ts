import { useBilling } from '@/shared/lib/billing/use-billing';

export function useNoticeSuffix(): '' | 'SelfHosted' {
    return useBilling().mode === 'self_hosted' ? 'SelfHosted' : '';
}
