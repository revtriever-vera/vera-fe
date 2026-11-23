import type { ReactElement, ReactNode } from 'react';
import type { PortfolioPerson } from '../lib/holder-filter';
import { PeopleContext } from '../lib/people-context';

export interface PeopleProviderProps {
    readonly people: readonly PortfolioPerson[];
    readonly children: ReactNode;
}

export function PeopleProvider({ people, children }: PeopleProviderProps): ReactElement {
    return <PeopleContext.Provider value={people}>{children}</PeopleContext.Provider>;
}
