# Migração para Tailwind CSS v4

Este diretório contém toda a documentação necessária para migrar o projeto Adega Manager do Tailwind CSS v3.4.11 para v4.

## Status Atual

- **Versão Atual**: Tailwind CSS v3.4.11
- **Versão Alvo**: Tailwind CSS v4.x
- **Componentes Afetados**: 50+ componentes UI
- **Configurações Personalizadas**: Sim (keyframes, cores, animações)

## Arquivos de Documentação

1. **[01-breaking-changes.md](./01-breaking-changes.md)** - Lista completa de mudanças que quebram compatibilidade
2. **[02-migration-checklist.md](./02-migration-checklist.md)** - Checklist passo-a-passo para migração
3. **[03-configuration-updates.md](./03-configuration-updates.md)** - Atualizações necessárias nos arquivos de configuração
4. **[04-component-updates.md](./04-component-updates.md)** - Mudanças específicas em componentes
5. **[05-testing-validation.md](./05-testing-validation.md)** - Guia de testes e validação
6. **[06-troubleshooting.md](./06-troubleshooting.md)** - Problemas comuns e soluções

## Motivação para Migração

### Problemas Atuais com v3.4.11
- Classes CSS arbitrárias limitadas (ex: `[background:radial-gradient(...)]` não funciona)
- Configuração complexa de keyframes personalizadas
- Limitações na geração dinâmica de classes
- Compatibilidade com componentes Aceternity UI

### Benefícios do v4
- Sintaxe CSS mais moderna com `@import`
- Melhor suporte para classes CSS arbitrárias
- Performance melhorada
- Sintaxe simplificada para configurações
- Melhor integração com ferramentas modernas

## Impacto Estimado

### Alto Impacto
- `tailwind.config.ts` - Reescrita completa necessária
- `postcss.config.js` - Atualizações na configuração PostCSS
- Componentes com classes arbitrárias - Revisão manual necessária

### Médio Impacto
- Componentes Aceternity UI - Podem precisar de ajustes
- Componentes com animações personalizadas
- Arquivos CSS principais (`index.css`, `App.css`)

### Baixo Impacto
- Componentes básicos usando classes padrão do Tailwind
- Lógica de negócio (hooks, contexts, etc.)

## Cronograma Estimado

1. **Preparação** (1-2 horas)
   - Backup do projeto
   - Análise detalhada de dependências
   
2. **Migração Core** (2-3 horas)
   - Atualização de configurações
   - Migração de arquivos CSS principais
   
3. **Migração de Componentes** (4-6 horas)
   - Revisão e atualização de componentes
   - Testes de funcionalidade
   
4. **Validação e Testes** (2-3 horas)
   - Testes completos da aplicação
   - Correção de problemas identificados

**Total Estimado**: 9-14 horas

## Pré-requisitos

- Node.js 18+ (já presente no projeto)
- Backup completo do projeto
- Ambiente de desenvolvimento configurado
- Conhecimento sobre as mudanças do Tailwind v4

## Próximos Passos

1. Revisar toda a documentação neste diretório
2. Executar backup completo: `npm run backup:full`
3. Seguir o checklist em `02-migration-checklist.md`
4. Testar cada etapa conforme `05-testing-validation.md`

---

**⚠️ ATENÇÃO**: Esta é uma migração que pode afetar toda a interface do usuário. É altamente recomendado fazer backup completo e testar em ambiente de desenvolvimento antes de aplicar em produção.