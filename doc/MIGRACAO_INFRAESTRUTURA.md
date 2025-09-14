# Plano de Migração da Adega Manager - Infraestrutura da Cliente

**Data de Criação**: 13/09/2025
**Última Atualização**: 13/09/2025 - Estratégia Revisada
**Status**: ⚠️ DESENVOLVIMENTO PRÉ-DEPLOY - Sistema Offline Durante Correções
**Sistema**: Adega Manager (925+ registros em produção)

## 📋 Resumo Executivo

### Situação Atual
- **Ambiente**: Deploy na conta pessoal do desenvolvedor (Vercel)
- **Banco**: Supabase com 925+ registros ativos
- **Status**: Sistema em produção com operações diárias
- **Usuários**: 3 usuários ativos (admin/employee/delivery)
- **Segurança**: 57 políticas RLS ativas

### ⚠️ ESTRATÉGIA REVISADA: DESENVOLVIMENTO PRÉ-DEPLOY

**DECISÃO CRÍTICA**: Deploy será retirado do ar durante desenvolvimento e só retornará online na nova infraestrutura da cliente **APÓS** todas as correções serem concluídas.

**Implicações**:
- Sistema temporariamente **OFFLINE** para usuários finais (3-5 dias)
- Desenvolvimento intensivo em ambiente local
- Correções completas em estoque, vendas e banco de dados
- Retorno online apenas com sistema 100% funcional

### Objetivo da Migração Final
- Transferir para conta Gmail da cliente
- Novo domínio personalizado via Hostinger
- Servidor KVM2 para backup/redundância
- Sistema robusto e sem pendências técnicas

---

## 🚨 FASE 1: PREPARAÇÃO E SISTEMA OFFLINE (CRÍTICO)

### 1.1 Backup Completo e Comunicação
```bash
# 1. Backup total do sistema
npm run backup

# 2. Backup das configurações
cp .env .env.backup

# 3. Comunicar stakeholders sobre período offline
# 4. Pausar deploy atual (manter apenas Supabase ativo)
# 5. Configurar ambiente de desenvolvimento robusto
```

### 1.2 Setup Ambiente Desenvolvimento
```bash
# Ambiente local para desenvolvimento intensivo
npm run dev
# Garantir acesso total ao Supabase
# MCP tools configurados
# Backup automático diário durante desenvolvimento
```

### 1.3 Mapeamento de Pendências Críticas
- **Sistema de Estoque**: Sprint 3 pendente (modal edição, histórico, filtros, alertas)
- **Sistema de Vendas**: Impressão térmica Atomo MO-5812 (48mm) precisa otimização
- **Banco de Dados**: Novos campos, tabela stock_movements, RLS policies atualizadas
- **Performance**: Otimizações de queries e índices

---

## 🛠️ FASE 2: DESENVOLVIMENTO E CORREÇÕES (3-5 DIAS)

### 2.1 Correções Sistema de Estoque (Sprint 3)

#### Pendências Identificadas:
```typescript
// Modal de edição completo para produtos
- [ ] ProductEditModal.tsx - Edição completa de produtos
- [ ] Validações de dados + integração com Supabase
- [ ] Interface otimizada para todos os campos

// Histórico de movimentações
- [ ] StockHistoryModal.tsx - Visualização de movimentações
- [ ] Integração com nova tabela stock_movements
- [ ] Filtros por tipo, data, usuário

// Filtros e alertas avançados
- [ ] Filtros por status de estoque (Normal/Baixo/Falta/Excesso)
- [ ] Sistema de alertas automáticos
- [ ] Dashboard de métricas de inventário
```

### 2.2 Correções Sistema de Vendas + Impressão Térmica

#### Issues Críticos:
```css
/* thermal-print.css - Otimização para Atomo MO-5812 (48mm) */
.receipt-print {
  width: 48mm !important;  /* Ajustar de 80mm para 48mm */
}

// Validações necessárias:
- [ ] Teste com impressora física Atomo MO-5812
- [ ] CSS otimizado para largura de 48mm
- [ ] Integração POS melhorada
- [ ] Performance da grid de produtos
```

### 2.3 Correções Banco de Dados

#### Schema Updates:
```sql
-- Novos campos para products
ALTER TABLE products ADD COLUMN:
  location VARCHAR(50),              -- Localização física
  turnover_classification VARCHAR(20), -- Alto/Médio/Baixo
  stock_status VARCHAR(20),          -- Status calculado
  max_stock INTEGER;                 -- Estoque máximo

-- Nova tabela para histórico
CREATE TABLE stock_movements (
  id UUID PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  movement_type VARCHAR(20),          -- IN/OUT/ADJUSTMENT
  quantity INTEGER,
  reason VARCHAR(255),
  user_id UUID,
  created_at TIMESTAMP
);
```

---

## 🌐 FASE 3: NOVA INFRAESTRUTURA (PARALELO)

### 3.1 Setup Hostinger + Nova Conta Vercel (Durante Desenvolvimento)
```bash
# Preparar paralelamente ao desenvolvimento:
# 1. Domínio personalizado na Hostinger
# 2. Nova conta Vercel (Gmail cliente)
# 3. Servidor KVM2 para redundância
# 4. Configurações DNS preparadas (sem ativar)
```

### 3.2 Migração Supabase
- **Opção A**: Transferir projeto atual (RECOMENDADO - preserva 925+ registros)
- **Opção B**: Novo projeto com migração completa
- Manter ambiente desenvolvimento ativo durante processo

---

## 🚀 FASE 4: DEPLOY FINAL E RETORNO ONLINE

### 4.1 Deploy Apenas com Sistema Completo
```bash
# Deploy APENAS após todas as correções concluídas:
# 1. Sistema de estoque 100% funcional (Sprint 3 concluído)
# 2. Sistema de vendas + impressão térmica validada
# 3. Banco de dados otimizado com novos campos
# 4. Performance e testes completos
# 5. Deploy na nova conta Vercel
```

### 4.2 Validação Exaustiva Pre-Deploy
```bash
# Checklist obrigatório antes de subir:
- [ ] Todos os modais de estoque funcionando
- [ ] Impressão térmica 48mm testada fisicamente
- [ ] Banco com novos campos e tabelas
- [ ] RLS policies atualizadas
- [ ] Performance otimizada
- [ ] Zero bugs conhecidos
```

### 4.3 DNS Switch e Retorno Online
```bash
# Ativação final do sistema:
# 1. DNS da Hostinger → Nova Vercel
# 2. SSL automático ativado
# 3. Comunicação aos usuários sobre retorno
# 4. Monitoramento intensivo primeiras 24h
```

---

## 🗑️ FASE 5: LIMPEZA E REMOÇÃO DEPLOY ANTIGO

### 5.1 Checklist Pré-Remoção
- [ ] Sistema novo 100% funcional
- [ ] Todos os usuários testaram e aprovaram
- [ ] DNS propagado completamente (24-48h)
- [ ] Backup de emergência confirmado
- [ ] Rollback plan documentado

### 5.2 Remoção Segura
```bash
# Passos para remoção
1. Pausar deploy (não deletar imediatamente)
2. Monitorar por 7 dias
3. Confirmar estabilidade do novo sistema
4. Deletar definitivamente
```

---

## ⚠️ Riscos e Mitigações

### Riscos Altos
| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Perda de dados | Alto | Baixo | Backup completo + teste de restore |
| Downtime prolongado | Alto | Médio | Deploy paralelo + DNS switch |
| Corrupção RLS | Alto | Baixo | Backup políticas + teste em staging |
| Falha DNS | Médio | Baixo | Configuração gradual + monitoramento |

### Plano de Rollback
1. **DNS Rollback**: Reverter DNS para deploy antigo (15 min)
2. **Database Rollback**: Restore do backup (30 min)
3. **Application Rollback**: Reativar deploy antigo (5 min)

---

## ⏱️ CRONOGRAMA DETALHADO REVISADO

### **Dia 1-2: Preparação e Sistema Offline**
- **Manhã**: Backup completo + comunicação stakeholders
- **Tarde**: Sistema offline + setup ambiente desenvolvimento
- **Noite**: Mapeamento detalhado das pendências

### **Dia 3-5: Desenvolvimento Intensivo**
- **Dia 3**: Correções sistema de estoque (Sprint 3)
  - ProductEditModal.tsx completo
  - StockHistoryModal.tsx funcional
  - Filtros avançados implementados
- **Dia 4**: Correções sistema de vendas + impressão térmica
  - CSS thermal-print.css otimizado para 48mm
  - Teste físico com impressora Atomo MO-5812
  - Performance da grid melhorada
- **Dia 5**: Correções banco de dados + otimizações
  - Novos campos em products
  - Tabela stock_movements criada
  - RLS policies atualizadas

### **Dia 6-7: Infraestrutura e Deploy**
- **Dia 6**: Setup nova conta Vercel + Hostinger
- **Dia 7**: Migração Supabase + Deploy final

### **Dia 8: Retorno Online**
- **Manhã**: Validação exaustiva completa
- **Tarde**: DNS switch + Sistema online
- **Noite**: Monitoramento e ajustes

**Total Estimado**: 8 dias (desenvolvimento intensivo com sistema offline 3-5 dias)

---

## 🔧 Comandos e Scripts Úteis

### Verificação de Status
```bash
# Verificar build local
npm run build

# Testar produção local
npm run preview

# Verificar lint
npm run lint

# Backup manual
npm run backup
```

### Troubleshooting
```bash
# Limpar cache Vite
rm -rf node_modules/.vite .vite dist
npm install

# Regenerar tipos Supabase
supabase gen types typescript --local > src/integrations/supabase/types.ts

# Verificar conectividade
curl -I https://uujkzvbgnfzuzlztrzln.supabase.co
```

---

## 📝 Checklist de Validação Pós-Migração

### Funcionalidades Críticas
- [ ] **Login/Logout** - Todos os usuários conseguem acessar
- [ ] **Dashboard** - KPIs carregando corretamente
- [ ] **POS System** - Vendas funcionando
- [ ] **Estoque** - Produtos, movimentações, código de barras
- [ ] **CRM** - Clientes, insights, interações
- [ ] **Entregas** - Sistema de tracking ativo
- [ ] **Relatórios** - Charts e analytics funcionando
- [ ] **Segurança** - RLS policies ativas

### Performance e Integração
- [ ] **Tempo de carregamento** < 3s
- [ ] **Mobile responsive** funcionando
- [ ] **MCP Tools** conectados
- [ ] **Aceternity UI** componentes carregando
- [ ] **Supabase** todas as queries funcionando
- [ ] **Backup automático** configurado

### Segurança
- [ ] **HTTPS** ativo e certificado válido
- [ ] **Headers de segurança** configurados
- [ ] **RLS policies** todas funcionando
- [ ] **Audit logs** sendo gerados
- [ ] **Roles** admin/employee/delivery funcionando

---

## 📞 Contatos e Referências

### Suporte Técnico
- **Hostinger**: Painel de controle + suporte 24/7
- **Vercel**: Dashboard + documentação
- **Supabase**: Dashboard + logs em tempo real

### Documentação de Referência
- `/doc/SYSTEM_OPERATIONS_GUIDE.md` - Operações do sistema
- `/doc/PERMISSIONS_SYSTEM_GUIDE.md` - Sistema de permissões
- `/CLAUDE.md` - Documentação completa do projeto

---

## ✅ Status das Tarefas

### ✅ Concluído
- Análise da infraestrutura atual
- Plano de migração detalhado
- Identificação de riscos e mitigações

### 🔄 Em Andamento
- Preparação do backup completo
- Documentação das configurações atuais

### ⏳ Pendente
- Setup da nova conta Vercel
- Configuração do domínio Hostinger
- Migração do banco Supabase
- Testes de validação completa
- Remoção do deploy antigo

---

**Última Atualização**: 13/09/2025
**Próximo Milestone**: Backup completo e setup nova conta Vercel
**Responsável**: Claude Code + Cliente