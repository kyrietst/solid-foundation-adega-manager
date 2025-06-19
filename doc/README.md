# Adega Manager - Documentação Técnica

## Visão Geral

O Adega Manager é uma aplicação web moderna desenvolvida para gerenciamento completo de adegas, oferecendo funcionalidades como controle de estoque, vendas, clientes (CRM), delivery e relatórios. A aplicação foi construída utilizando tecnologias modernas e seguindo as melhores práticas de desenvolvimento.

> **Atualização 18/06/2025**: Hooks centrais e componente de notificações refatorados, eliminando duplicações e melhorando performance.

## Stack Tecnológica

### Frontend
- **React 18**: Framework principal para construção da interface
- **TypeScript**: Linguagem principal, oferecendo tipagem estática
- **Vite**: Build tool e dev server
- **TailwindCSS**: Framework CSS para estilização
- **Shadcn/ui**: Biblioteca de componentes baseada em Radix UI
- **React Router Dom**: Gerenciamento de rotas
- **React Query**: Gerenciamento de estado e cache de dados
- **React Hook Form**: Gerenciamento de formulários
- **Zod**: Validação de schemas
- **Recharts**: Biblioteca para criação de gráficos

### Backend
- **Supabase**: Plataforma de backend como serviço (BaaS)
  - Banco de dados PostgreSQL
  - Autenticação e autorização
  - Armazenamento de arquivos
  - Funções serverless
  - Realtime subscriptions
  - RLS (Row Level Security)

## Estrutura do Projeto

```
src/
├── components/     # Componentes reutilizáveis
│   ├── ui/         # Componentes de UI específicos da aplicação
│   ├── layout/     # Componentes de layout da aplicação
├── contexts/       # Contextos React
├── hooks/          # Hooks customizados
├── integrations/   # Integrações com serviços externos
├── lib/            # Utilitários e configurações
└── pages/          # Páginas da aplicação
```

## Módulos Principais

### 1. Dashboard
Visão geral do negócio com estatísticas importantes, gráficos e indicadores de performance.

### 2. Produtos e Estoque
Gerenciamento completo de produtos, categorias, estoque e movimentação.

### 3. Vendas
Registro e acompanhamento de vendas, checkout, pagamentos e histórico de transações.

### 4. CRM (Customer Relationship Management)
Sistema completo de gestão de clientes com:
- Perfis detalhados e indicador de completude
- Segmentação automática de clientes
- Registro e visualização de interações
- Insights automáticos baseados em padrões de compra
- Dashboard analítico com tendências e oportunidades
- Automações de enriquecimento de dados

### 5. Delivery
Controle de entregas, rotas, status e integração com clientes.

### 6. Relatórios
Sistema de relatórios customizáveis para análise de dados.

### 7. Usuários e Permissões
Gerenciamento de usuários com diferentes níveis de acesso.

### 8. Notificações
Sistema de notificações em tempo real integrado ao Supabase Realtime, incluindo componente `NotificationBell` e popover detalhado.
Gerenciamento de usuários com diferentes níveis de acesso.

## Guia de Desenvolvimento

### 1. Padrões de Código

#### Nomenclatura
- Use PascalCase para componentes React
- Use camelCase para funções e variáveis
- Use UPPER_CASE para constantes
- Prefixe interfaces com 'I' (ex: IUser)
- Prefixe tipos com 'T' (ex: TUserRole)

#### Estrutura de Componentes
- Um componente por arquivo
- Mantenha componentes pequenos e focados
- Use composição ao invés de herança
- Extraia lógica complexa para hooks customizados

### 2. Gerenciamento de Estado

- Use React Query para dados do servidor
- Use Context API para estado global da aplicação
- Use useState para estado local de componentes
- Evite prop drilling - prefira Context ou composição

### 3. Segurança

#### Frontend
- Sanitize todas as entradas de usuário
- Use HTTPS para todas as requisições
- Implemente rate limiting no cliente
- Não armazene dados sensíveis no localStorage
- Use tokens JWT com refresh token
- Implemente logout automático por inatividade

#### Backend (Supabase)
- Use RLS (Row Level Security) para controle de acesso
- Implemente políticas de segurança por tabela
- Use funções SQL para operações complexas
- Mantenha backups regulares do banco de dados
- Monitore logs de acesso e erros

### 4. Performance

- Implemente lazy loading de rotas
- Use memo e useMemo para otimizações
- Otimize imagens antes do upload
- Implemente infinite scroll onde apropriado
- Use cache adequadamente
- Minimize bundle size

### 5. Acessibilidade

- Use elementos semânticos HTML5
- Implemente navegação por teclado
- Mantenha contraste adequado
- Forneça textos alternativos para imagens
- Teste com leitores de tela

### 6. Testes

- Escreva testes unitários para componentes
- Implemente testes de integração
- Teste fluxos críticos end-to-end
- Mantenha cobertura de testes adequada

## Fluxo de Trabalho

1. **Desenvolvimento**
   ```bash
   npm run dev
   ```

2. **Build de Produção**
   ```bash
   npm run build
   ```

3. **Preview do Build**
   ```bash
   npm run preview
   ```

4. **Linting**
   ```bash
   npm run lint
   ```

## Boas Práticas

### Commits
- Use commits semânticos
- Mantenha commits pequenos e focados
- Escreva mensagens descritivas

### Code Review
- Revise mudanças de segurança com atenção
- Verifique performance em mudanças críticas
- Teste em diferentes navegadores
- Valide acessibilidade

### Documentação
- Mantenha esta documentação atualizada
- Documente decisões arquiteturais
- Comente código complexo
- Mantenha um changelog

## Troubleshooting

### Problemas Comuns

1. **Erro de CORS**
   - Verifique configurações do Supabase
   - Confirme origens permitidas

2. **Problemas de Performance**
   - Use React DevTools para profiling
   - Verifique re-renders desnecessários
   - Otimize queries do banco

3. **Erros de Autenticação**
   - Verifique tokens
   - Confirme políticas RLS
   - Valide permissões

4. **Dados CRM desatualizados**
   - Verifique triggers de automação
   - Confirme execução de funções do banco
   - Valide integridade de dados

## Roadmap e Melhorias Futuras

1. **Performance**
   - Implementar SSR
   - Otimizar bundle size
   - Melhorar cache strategy

2. **Funcionalidades**
   - Integração avançada com sistemas de pagamento
   - App mobile
   - Sistema de fidelidade e pontos
   - Campanhas de marketing automatizadas

3. **Infraestrutura**
   - CI/CD
   - Monitoramento
   - Analytics

4. **CRM**
   - Integração com email marketing
   - Análise preditiva de comportamento
   - Detecção automática de churn

## Contato e Suporte

Para questões técnicas ou suporte:
- Abra uma issue no repositório
- Documente bugs encontrados
- Sugira melhorias via pull requests

## Licença

Este projeto é proprietário e confidencial. Todos os direitos reservados. 