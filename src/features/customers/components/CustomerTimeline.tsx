
import React from 'react';
import { Card, CardContent } from '@/shared/ui/primitives/card';
import { ShoppingBag, PhoneCall, FileText, Clock, Calendar, DollarSign, ShoppingCart, StickyNote, Settings } from 'lucide-react';
import { formatCurrency } from '@/core/config/utils';

interface TimelineItem {
    id: string;
    type: string;
    title: string;
    created_at: string;
    description: string;
    amount?: number;
}

interface CustomerTimelineProps {
    timeline: TimelineItem[];
}

export const CustomerTimeline: React.FC<CustomerTimelineProps> = ({ timeline }) => {
    // Map activity types to icons and styles
    const getActivityConfig = (type: string) => {
        switch (type) {
            case 'sale':
            case 'purchase':
                return {
                    icon: ShoppingCart,
                    color: 'text-emerald-400',
                    bgColor: 'bg-emerald-500',
                    borderColor: 'border-emerald-500',
                    glow: 'shadow-[0_0_15px_rgba(52,211,153,0.3)]'
                };
            case 'interaction':
                return {
                    icon: PhoneCall,
                    color: 'text-blue-400',
                    bgColor: 'bg-blue-500',
                    borderColor: 'border-blue-500',
                    glow: 'shadow-[0_0_15px_rgba(96,165,250,0.3)]'
                };
            case 'note':
                return {
                    icon: StickyNote,
                    color: 'text-zinc-400',
                    bgColor: 'bg-zinc-500',
                    borderColor: 'border-zinc-500',
                    glow: 'shadow-none'
                };
            case 'system':
                return {
                    icon: Settings,
                    color: 'text-violet-400',
                    bgColor: 'bg-violet-500',
                    borderColor: 'border-violet-500',
                    glow: 'shadow-[0_0_15px_rgba(167,139,250,0.3)]'
                };
            default:
                return {
                    icon: Clock,
                    color: 'text-zinc-400',
                    bgColor: 'bg-zinc-600',
                    borderColor: 'border-zinc-600',
                    glow: 'shadow-none'
                };
        }
    };

    const formatTimelineDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

        if (diffHours < 1) return 'Agora mesmo';
        if (diffHours < 24) return `${diffHours}h atrás`;

        const diffDays = Math.floor(diffHours / 24);
        if (diffDays === 1) return 'Ontem';
        if (diffDays < 7) return `${diffDays} dias atrás`;

        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="glass-panel rounded-3xl p-6 lg:p-8 relative min-h-[400px] bg-black/40 backdrop-blur-xl border border-white/10">
            <h3 className="text-lg font-bold text-white mb-8 flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Histórico de Atividades
            </h3>

            {timeline.length === 0 ? (
                <div className="text-center py-12 text-zinc-500">
                    <Calendar className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-medium">Nenhuma atividade registrada</p>
                    <p className="text-xs mt-1 text-zinc-600">As interações aparecerão aqui.</p>
                </div>
            ) : (
                <div className="relative pl-4">
                    {/* Vertical Gradient Line */}
                    <div className="absolute left-[27px] top-2 bottom-6 w-px bg-gradient-to-b from-primary via-zinc-800 to-transparent"></div>

                    <div className="space-y-8">
                        {timeline.slice(0, 10).map((item) => {
                            const config = getActivityConfig(item.type);
                            const Icon = config.icon;

                            return (
                                <div key={item.id} className="relative flex gap-6 group">
                                    {/* Node / Icon */}
                                    <div className="relative z-10 flex flex-col items-center">
                                        <div className={`size-6 rounded-full ${config.bgColor} ${config.glow} flex items-center justify-center border-2 border-zinc-950 ring-4 ring-black/40`}>
                                            <div className="size-1.5 bg-white rounded-full"></div>
                                        </div>
                                    </div>

                                    {/* Content Card */}
                                    <div className="flex-1 -mt-1.5 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all cursor-default">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`text-xs font-bold uppercase tracking-wider ${config.color}`}>
                                                {item.type}
                                            </span>
                                            <span className="text-zinc-500 text-xs flex items-center gap-1">
                                                <Icon className="h-3 w-3" />
                                                {formatTimelineDate(item.created_at)}
                                            </span>
                                        </div>

                                        <h4 className="text-white font-bold text-base mb-1">
                                            {item.title}
                                        </h4>
                                        <p className="text-zinc-400 text-sm leading-relaxed">
                                            {item.description}
                                        </p>

                                        {item.amount && (
                                            <div className="mt-3 flex items-center gap-2">
                                                <span className="inline-flex items-center px-2 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-xs text-emerald-400 font-mono font-bold">
                                                    {formatCurrency(item.amount)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {timeline.length > 10 && (
                        <div className="text-center pt-8 pl-8">
                            <button className="text-xs text-zinc-500 hover:text-white transition-colors uppercase tracking-wider font-bold">
                                Ver todo o histórico
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
