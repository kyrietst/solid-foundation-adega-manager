import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Badge } from '@/shared/ui/primitives/badge';
import { Settings } from 'lucide-react';

interface MaintenancePlaceholderProps {
    title: string;
    description: string;
    icon: React.ElementType;
}

export const MaintenancePlaceholder: React.FC<MaintenancePlaceholderProps> = ({ title, description, icon: Icon }) => (
    <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm shadow-lg hover:shadow-2xl hover:shadow-yellow-500/10 hover:border-yellow-400/30 transition-all duration-300">
        <CardHeader>
            <CardTitle className="text-sm text-white font-medium flex items-center gap-2">
                <Icon className="h-4 w-4 text-yellow-400" />
                {title}
            </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8 relative overflow-hidden group">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-orange-500/5"></div>

            <div className="relative z-10 text-center">
                <div className="relative mb-4">
                    <div className="absolute inset-0 bg-yellow-500/20 rounded-full blur-lg group-hover:blur-xl transition-all duration-300"></div>
                    <Settings className="h-16 w-16 text-yellow-400 relative z-10 animate-pulse group-hover:scale-110 transition-transform duration-300" />
                </div>
                <p className="text-sm text-white/70 text-center mb-3">{description}</p>
                <Badge variant="outline" className="border-yellow-400/30 text-yellow-400 bg-yellow-400/10">
                    🔧 Em Manutenção
                </Badge>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-4 left-4 w-2 h-2 bg-yellow-400/60 rounded-full animate-pulse"></div>
            <div className="absolute bottom-6 right-8 w-1.5 h-1.5 bg-orange-400/60 rounded-full animate-pulse delay-700"></div>
        </CardContent>
    </Card>
);
