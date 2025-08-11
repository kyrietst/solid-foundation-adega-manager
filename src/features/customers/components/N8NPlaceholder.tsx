import { MaintenancePlaceholder } from '@/shared/ui/composite/maintenance-placeholder';

interface N8NPlaceholderProps {
  automationType?: 'whatsapp' | 'birthday' | 'churn' | 'recommendations' | 'general';
  customerName?: string;
  className?: string;
}

export const N8NPlaceholder = ({ 
  automationType = 'general',
  customerName,
  className 
}: N8NPlaceholderProps) => {
  const variantConfig = {
    whatsapp: {
      title: 'WhatsApp Campaigns',
      description: customerName 
        ? `Campanhas automatizadas de WhatsApp para ${customerName} baseadas no perfil e comportamento.`
        : 'Sistema de automação para campanhas personalizadas via WhatsApp.',
      variant: 'whatsapp' as const,
      features: [
        'Mensagens personalizadas por segmento',
        'Campanhas de aniversário automáticas',
        'Follow-up pós-venda',
        'Promoções segmentadas',
        'Recuperação de carrinho abandonado'
      ]
    },
    birthday: {
      title: 'Automação de Aniversários',
      description: 'Sistema automatizado para envio de mensagens e ofertas especiais em datas comemorativas.',
      variant: 'n8n' as const,
      features: [
        'Detecção automática de aniversários',
        'Mensagens personalizadas',
        'Descontos especiais automáticos',
        'Agendamento inteligente',
        'Métricas de conversão'
      ]
    },
    churn: {
      title: 'Prevenção de Churn',
      description: 'IA identifica clientes em risco e aciona campanhas automáticas de retenção.',
      variant: 'ai' as const,
      features: [
        'Análise preditiva de churn',
        'Campanhas de reativação',
        'Ofertas personalizadas',
        'Alertas para equipe comercial',
        'Score de probabilidade de retorno'
      ]
    },
    recommendations: {
      title: 'Recomendações IA',
      description: customerName
        ? `Sistema de recomendações personalizadas para ${customerName} baseado no histórico de compras.`
        : 'Engine de recomendações usando machine learning para sugerir produtos.',
      variant: 'ai' as const,
      features: [
        'Análise de padrões de compra',
        'Recomendações colaborativas',
        'Cross-selling inteligente',
        'Up-selling automático',
        'A/B testing de ofertas'
      ]
    },
    general: {
      title: 'Automações N8N',
      description: 'Plataforma de automação para integrar todos os sistemas e workflows da adega.',
      variant: 'n8n' as const,
      features: [
        'Workflows automatizados',
        'Integração com sistemas externos',
        'Triggers baseados em eventos',
        'Processamento de dados em lote',
        'Monitoramento de automações'
      ]
    }
  };

  const config = variantConfig[automationType];

  return (
    <MaintenancePlaceholder
      title={config.title}
      description={config.description}
      variant={config.variant}
      expectedDate="Q2 2025"
      progress={45}
      features={config.features}
      className={className}
    />
  );
};