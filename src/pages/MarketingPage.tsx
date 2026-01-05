import React from 'react';
import { AutomationCenter } from '@/features/marketing/components/AutomationCenter';

export default function MarketingPage() {
    return (
        <div className="h-full w-full flex flex-col p-6 space-y-6 overflow-hidden">
            <AutomationCenter />
        </div>
    );
}
