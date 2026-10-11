import type { ApiPaths } from '@/shared/lib/api/api-paths';
import type ptBRSpendingConnections from '@/shared/lib/i18n/resources/pt-BR/spendingConnections.json';
import type { ConnectionView } from '../types';

type Leaves<Dictionary, Prefix extends string = ''> = {
    [Key in keyof Dictionary & string]: Dictionary[Key] extends string ? `${Prefix}${Key}` : Leaves<Dictionary[Key], `${Prefix}${Key}.`>;
}[keyof Dictionary & string];

export type SpendingConnectionsKey = Leaves<typeof ptBRSpendingConnections>;

export type ConnectionStatus = ConnectionView['status'];

export type SaveCredentialsBody = NonNullable<
    ApiPaths['/spending/connections/credentials']['put']['requestBody']
>['content']['application/json'];

export type AddItemsBody = NonNullable<ApiPaths['/spending/connections']['post']['requestBody']>['content']['application/json'];

export type AddItemsResponse = ApiPaths['/spending/connections']['post']['responses'][200]['content']['application/json'];

export type ItemResult = AddItemsResponse['results'][number];

export type ItemOutcome = ItemResult['outcome'];

export interface RemoveOptions {
    readonly purgeTransactions: boolean;
}

export interface RemoveConnectionInput extends RemoveOptions {
    readonly id: string;
}

export const ITEM_ID_LIMIT: number = 10;

export const TUTORIAL_STEP_COUNT: number = 6;

export const TUTORIAL_TEXT_REVIEW_CARD: number = 14;
