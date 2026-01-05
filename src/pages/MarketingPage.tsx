import { CampaignManager } from '@/features/marketing/components/CampaignManager';

export default function MarketingPage() {
    return (
        <div className="h-full w-full flex flex-col p-6 space-y-6 overflow-hidden">
            <CampaignManager />
        </div>
    );
}
