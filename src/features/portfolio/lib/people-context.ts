import { createContext, useContext, type Context } from 'react';
import type { PortfolioPerson } from './holder-filter';

export const PeopleContext: Context<readonly PortfolioPerson[]> = createContext<readonly PortfolioPerson[]>([]);

const MIN_PEOPLE_FOR_HOLDER: number = 2;

export interface PeopleState {
    readonly people: readonly PortfolioPerson[];
    readonly multi: boolean;
}

export function usePeople(): PeopleState {
    const people: readonly PortfolioPerson[] = useContext(PeopleContext);
    return { people, multi: people.length >= MIN_PEOPLE_FOR_HOLDER };
}
