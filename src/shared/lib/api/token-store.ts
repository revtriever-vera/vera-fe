type Listener = (token: string | null) => void;

let accessToken: string | null = null;
const listeners: Set<Listener> = new Set<Listener>();

export const tokenStore: { get(): string | null; set(token: string | null): void; subscribe(listener: Listener): () => void } = {
    get(): string | null {
        return accessToken;
    },
    set(token: string | null): void {
        accessToken = token;
        listeners.forEach((listener): void => {
            listener(token);
        });
    },
    subscribe(listener: Listener): () => void {
        listeners.add(listener);
        return (): boolean => listeners.delete(listener);
    }
};
