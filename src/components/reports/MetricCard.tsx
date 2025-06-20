import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label: string;
    positiveIsGood?: boolean;
  };
  isLoading?: boolean;
  className?: string;
}

export const MetricCard = ({
  title,
  value,
  description,
  icon,
  trend,
  isLoading = false,
  className = '',
}: MetricCardProps) => {
  const renderTrend = () => {
    if (!trend) return null;
    
    const isPositive = trend.value >= 0;
    const isGood = trend.positiveIsGood ? isPositive : !isPositive;
    const trendColor = isGood ? 'text-green-500' : 'text-red-500';
    const trendIcon = isPositive ? '↑' : '↓';
    
    return (
      <div className={`text-xs font-medium ${trendColor} flex items-center`}>
        {trendIcon} {Math.abs(trend.value)}% {trend.label}
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-4 rounded-full" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-1/2 mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        {icon && (
          <div className="h-4 w-4 text-muted-foreground">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">
            {description}
          </p>
        )}
        {renderTrend()}
      </CardContent>
    </Card>
  );
};

interface MetricCardsProps {
  metrics: Array<{
    title: string;
    value: string | number;
    description?: string;
    icon?: React.ReactNode;
    trend?: {
      value: number;
      label: string;
      positiveIsGood?: boolean;
    };
    isLoading?: boolean;
  }>;
  className?: string;
  gridCols?: string;
}

export const MetricCards = ({
  metrics,
  className = '',
  gridCols = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4',
}: MetricCardsProps) => {
  return (
    <div className={cn('grid', gridCols, className)}>
      {metrics.map((metric, index) => (
        <MetricCard key={index} {...metric} />
      ))}
    </div>
  );
};
