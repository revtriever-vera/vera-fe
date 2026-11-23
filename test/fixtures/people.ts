import type { PortfolioPerson } from '@/features/portfolio/lib/holder-filter';

export const MARIA: PortfolioPerson = { userId: '00000000-0000-4000-8000-000000000001', name: 'Maria Teste' };
export const ANA: PortfolioPerson = { userId: '00000000-0000-4000-8000-000000000002', name: 'Ana Souza' };

export const TWO_PEOPLE: readonly PortfolioPerson[] = [MARIA, ANA];
