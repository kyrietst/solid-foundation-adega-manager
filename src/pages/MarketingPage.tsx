import { CampaignManager } from '@/features/marketing/components/CampaignManager';
import { PremiumBackground } from '@/shared/ui/composite/PremiumBackground';

export default function MarketingPage() {
    return (
        <>
            <PremiumBackground className="fixed inset-0 z-0 pointer-events-none" />
            <div className="relative z-10 w-full h-full flex flex-col p-6 space-y-6 overflow-hidden">
                <CampaignManager />
            </div>
        </>
    );
}
