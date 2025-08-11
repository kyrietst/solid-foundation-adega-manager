import { MaintenancePlaceholder } from '@/shared/ui/composite/maintenance-placeholder';

interface GoogleMapsPlaceholderProps {
  customerAddress?: string;
  variant?: 'customer' | 'delivery' | 'analytics';
  className?: string;
}

export const GoogleMapsPlaceholder = ({ 
  customerAddress, 
  variant = 'customer',
  className 
}: GoogleMapsPlaceholderProps) => {
  const variantConfig = {
    customer: {
      title: 'Localização do Cliente',
      description: customerAddress 
        ? `Mapa interativo mostrará a localização em: ${customerAddress}`
        : 'Mapa interativo com a localização do cliente será exibido aqui quando o endereço estiver disponível.',
      features: [
        'Visualização da localização no mapa',
        'Cálculo de distância da adega',
        'Rota otimizada para delivery',
        'Street View integrado'
      ]
    },
    delivery: {
      title: 'Rotas de Delivery',
      description: 'Sistema de otimização de rotas e acompanhamento em tempo real das entregas.',
      features: [
        'Otimização automática de rotas',
        'Rastreamento em tempo real',
        'Estimativa de tempo de chegada',
        'Histórico de entregas por região'
      ]
    },
    analytics: {
      title: 'Mapa de Clientes',
      description: 'Visualização geográfica da distribuição de clientes e análise de mercado por região.',
      features: [
        'Heatmap de concentração de clientes',
        'Análise de penetração por bairro',
        'Identificação de áreas de oportunidade',
        'Métricas de entrega por região'
      ]
    }
  };

  const config = variantConfig[variant];

  return (
    <MaintenancePlaceholder
      title={config.title}
      description={config.description}
      variant="maps"
      expectedDate="Q1 2025"
      progress={75}
      features={config.features}
      className={className}
    />
  );
};