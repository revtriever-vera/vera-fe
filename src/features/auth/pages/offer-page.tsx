import type { ReactElement } from 'react';
import { EndorsementSeal } from '@/shared/ui/endorsement-seal';
import { LoginHero } from '../components/login-hero';
import { OfferBox } from '../components/offer-box';

export interface OfferPageProps {
    readonly token: string;
    readonly onRedeemed: () => void;
}

export function OfferPage({ token, onRedeemed }: OfferPageProps): ReactElement {
    return (
        <main className="grid min-h-dvh grid-cols-[minmax(0,1fr)] grid-rows-[220px_1fr] bg-surface min-[861px]:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] min-[861px]:grid-rows-1">
            <LoginHero />
            <div className="relative grid grid-cols-[minmax(0,1fr)] place-content-center place-items-center px-[clamp(16px,5vw,64px)] py-10 min-[861px]:pb-16">
                <OfferBox token={token} onRedeemed={onRedeemed} />
                <EndorsementSeal className="mt-7 min-[861px]:absolute min-[861px]:inset-x-0 min-[861px]:bottom-5 min-[861px]:mt-0" />
            </div>
        </main>
    );
}
