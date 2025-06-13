# Melhorias do Módulo Dashboard

## Visão Geral

O Dashboard é o ponto central de visualização de informações do Adega Manager, oferecendo uma visão consolidada do negócio. As melhorias propostas visam transformá-lo em uma ferramenta ainda mais poderosa para tomada de decisões, com dados em tempo real e visualizações personalizáveis.

## Estado Atual

Atualmente, o Dashboard apresenta:
- Métricas básicas (total de clientes, produtos em estoque)
- Métricas financeiras (apenas para administradores)
- Gráficos simples de vendas por mês
- Lista de atividades recentes
- Visualização estática sem filtros

## Melhorias Propostas

### 1. Indicadores de Performance em Tempo Real

**Descrição:** Implementar métricas que se atualizam automaticamente sem necessidade de recarregar a página.

**Implementação:**
- Utilizar Supabase Realtime para assinaturas de dados
- Criar componente `<LiveMetric />` para atualização automática
- Implementar cache inteligente para reduzir requisições

**Benefícios:**
- Visualização imediata de mudanças no negócio
- Redução da latência na tomada de decisões
- Experiência mais dinâmica para o usuário

### 2. Gráficos Interativos com Filtros Customizáveis

**Descrição:** Permitir que usuários interajam com os gráficos, aplicando filtros e alterando visualizações.

**Implementação:**
- Migrar para biblioteca de gráficos mais robusta (Nivo ou Visx)
- Criar componente `<FilterableChart />` com controles de filtro
- Implementar sistema de salvamento de preferências de visualização

**Filtros a implementar:**
- Período (dia, semana, mês, trimestre, ano)
- Categoria de produto
- Canal de venda
- Região geográfica
- Comparativo com períodos anteriores

### 3. Alertas Inteligentes Baseados em Métricas

**Descrição:** Sistema de alertas que notifica usuários sobre eventos importantes ou anomalias.

**Implementação:**
- Criar sistema de regras configuráveis para alertas
- Implementar algoritmo de detecção de anomalias
- Desenvolver componente `<AlertCenter />` para exibição e gerenciamento

**Tipos de alertas:**
- Estoque abaixo do mínimo
- Picos ou quedas anormais de vendas
- Metas atingidas ou em risco
- Produtos sem movimento
- Clientes inativos

### 4. Dashboard Personalizável por Usuário

**Descrição:** Permitir que cada usuário configure seu próprio dashboard com os widgets e métricas mais relevantes para sua função.

**Implementação:**
- Criar sistema de widgets modulares
- Implementar interface drag-and-drop para organização
- Desenvolver backend para salvar configurações por usuário

**Widgets disponíveis:**
- Cards de métricas
- Gráficos diversos
- Listas de tarefas
- Calendário de eventos
- Notificações
- Atividades recentes

### 5. Integração com Previsões de Vendas

**Descrição:** Incorporar modelos preditivos para auxiliar no planejamento e tomada de decisões.

**Implementação:**
- Desenvolver algoritmo de previsão baseado em histórico
- Criar visualizações comparativas (previsto vs. realizado)
- Implementar ajustes sazonais e detecção de tendências

**Funcionalidades:**
- Previsão de vendas para próximos períodos
- Identificação de produtos com potencial de crescimento
- Alertas de tendências de queda
- Recomendações de estoque baseadas em previsões

## Arquitetura Técnica

### Componentes Front-end

```tsx
// Exemplo de componente LiveMetric
const LiveMetric: React.FC<LiveMetricProps> = ({ 
  metricKey, 
  title, 
  format = 'number',
  icon
}) => {
  const { data, isLoading } = useRealtimeMetric(metricKey);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-[100px]" />
        ) : (
          <div className="flex items-center">
            {icon && <icon className="h-8 w-8 text-muted-foreground" />}
            <div className="ml-4">
              <div className="text-2xl font-bold">
                {formatMetric(data.value, format)}
              </div>
              {data.trend !== undefined && (
                <TrendIndicator value={data.trend} />
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
```

### Hooks e Serviços

```tsx
// Hook para métricas em tempo real
const useRealtimeMetric = (metricKey: string) => {
  const [data, setData] = useState<MetricData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = useSupabaseClient();
  
  useEffect(() => {
    // Carregar dados iniciais
    fetchMetricData();
    
    // Inscrever para atualizações
    const channel = supabase
      .channel(`metric-${metricKey}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'metrics',
        filter: `key=eq.${metricKey}`
      }, (payload) => {
        setData(transformMetricData(payload.new));
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [metricKey]);
  
  const fetchMetricData = async () => {
    setIsLoading(true);
    // Implementação da busca de dados
    setIsLoading(false);
  };
  
  return { data, isLoading, refetch: fetchMetricData };
};
```

## Integrações com Backend

### Funções SQL para Métricas

```sql
-- Função para calcular métricas de vendas
CREATE OR REPLACE FUNCTION calculate_sales_metrics()
RETURNS TABLE (
  key TEXT,
  value NUMERIC,
  trend NUMERIC,
  updated_at TIMESTAMP
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  
  -- Vendas do dia
  SELECT 
    'sales_today' as key,
    COALESCE(SUM(total_amount), 0) as value,
    CASE 
      WHEN LAG(SUM(total_amount)) OVER () > 0 
      THEN (SUM(total_amount) - LAG(SUM(total_amount)) OVER ()) / LAG(SUM(total_amount)) OVER () * 100
      ELSE 0
    END as trend,
    NOW() as updated_at
  FROM sales
  WHERE DATE(created_at) = CURRENT_DATE
  
  UNION ALL
  
  -- Outras métricas aqui
  
  ;
END;
$$;
```

### API Endpoints

Novos endpoints a serem implementados:
- `GET /api/dashboard/metrics` - Retorna todas as métricas principais
- `GET /api/dashboard/metrics/:key` - Retorna uma métrica específica
- `GET /api/dashboard/charts/:chartId` - Retorna dados para um gráfico específico
- `POST /api/dashboard/preferences` - Salva preferências do usuário
- `GET /api/dashboard/alerts` - Retorna alertas ativos

## Cronograma de Implementação

| Funcionalidade | Prioridade | Estimativa | Dependências |
|---------------|------------|------------|--------------|
| Indicadores em Tempo Real | Alta | 2 semanas | Supabase Realtime |
| Gráficos Interativos | Média | 3 semanas | Biblioteca de gráficos |
| Sistema de Alertas | Média | 2 semanas | Indicadores em Tempo Real |
| Dashboard Personalizável | Baixa | 4 semanas | Componentes modulares |
| Previsões de Vendas | Baixa | 5 semanas | Histórico de dados suficiente |

## Métricas de Sucesso

Para avaliar o sucesso das melhorias, serão monitorados:

1. **Engajamento**
   - Tempo médio gasto no dashboard
   - Frequência de visitas
   - Interações com filtros e gráficos

2. **Performance**
   - Tempo de carregamento
   - Uso de recursos do cliente
   - Número de requisições ao servidor

3. **Negócio**
   - Redução no tempo de tomada de decisão
   - Aumento na precisão de previsões
   - Melhoria na gestão de estoque

## Próximos Passos

1. Validar proposta com stakeholders
2. Criar protótipos de alta fidelidade
3. Implementar MVP das métricas em tempo real
4. Coletar feedback inicial
5. Refinar e expandir funcionalidades 