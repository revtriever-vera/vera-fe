import type { paths } from '@/shared/lib/api/schema';

export type ConcentrationResponse = paths['/portfolio/concentration']['get']['responses']['200']['content']['application/json'];
export type IssuerRow = ConcentrationResponse['byIssuer'][number];
export type IssuerOthers = NonNullable<ConcentrationResponse['byIssuerOthers']>;
export type SectorRow = ConcentrationResponse['bySector'][number];

export const SECTOR_KEYS = [
    'financeiro',
    'energia_eletrica',
    'petroleo_gas',
    'mineracao_siderurgia',
    'papel_celulose',
    'bens_industriais',
    'tecnologia',
    'consumo',
    'saude',
    'varejo',
    'imobiliario_logistica',
    'imobiliario_shoppings',
    'imobiliario_recebiveis',
    'imobiliario_lajes',
    'imobiliario_hibrido',
    'etf_indice',
    'cripto'
] as const;

export type SectorKey = (typeof SECTOR_KEYS)[number];

export const ISSUER_BUCKET_KEYS = ['funds', 'crypto', 'missing_issuer', 'unmapped'] as const;

export type IssuerBucketKey = (typeof ISSUER_BUCKET_KEYS)[number];
