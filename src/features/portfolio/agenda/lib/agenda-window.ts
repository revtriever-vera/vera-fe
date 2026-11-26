import { AGENDA_WINDOW_DAYS } from '../types';

export interface AgendaWindow {
    readonly from: string;
    readonly to: string;
}

const MS_PER_DAY: number = 86_400_000;

function civilDay(date: Date): string {
    const month: string = String(date.getMonth() + 1).padStart(2, '0');
    const day: string = String(date.getDate()).padStart(2, '0');
    return `${String(date.getFullYear())}-${month}-${day}`;
}

export function agendaWindow(now: Date): AgendaWindow {
    const end: Date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
    const last: Date = new Date(end.getTime() + AGENDA_WINDOW_DAYS * MS_PER_DAY);
    return { from: civilDay(now), to: civilDay(last) };
}
