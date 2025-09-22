# 🤝 Guia de Contribuição - Documentação Adega Manager

> Como contribuir e manter a documentação organizada e atualizada

## 🎯 Visão Geral

Esta documentação segue uma **arquitetura estruturada** para facilitar navegação, manutenção e contribuições. Antes de adicionar ou modificar conteúdo, leia este guia para manter a consistência.

## 📁 Estrutura da Documentação

### Organização por Propósito
```
docs/
├── 01-getting-started/     # Para novos desenvolvedores
├── 02-architecture/        # Para entender o sistema
├── 03-modules/            # Para trabalhar em funcionalidades
├── 04-design-system/      # Para UI/UX
├── 05-business/           # Para stakeholders
├── 06-operations/         # Para usuários e suporte
├── 07-changelog/          # Para histórico
├── 08-testing/            # Para QA
├── 09-api/               # Para integrações
└── 10-legacy/            # Para conteúdo arquivado
```

### Numeração e Hierarquia
- **Números sequenciais** para ordem lógica de leitura
- **READMEs obrigatórios** em cada pasta principal
- **Links cruzados** entre documentações relacionadas
- **Templates padronizados** para consistência

## 📋 Como Contribuir

### 1. Identificar o Tipo de Contribuição

#### 🏁 Getting Started
- Guias de instalação e setup
- Tutoriais para iniciantes
- Referências rápidas

#### 🏗️ Arquitetura
- Documentação técnica detalhada
- Diagramas e fluxos de sistema
- Decisões arquiteturais

#### ⚙️ Módulos
- Documentação específica de funcionalidades
- Guias de desenvolvimento por feature
- APIs e interfaces

#### 📊 Negócio
- Regras de negócio
- Fluxos de usuário
- KPIs e métricas

#### 🔧 Operacional
- Manuais do usuário
- Guias de troubleshooting
- Procedimentos de manutenção

### 2. Escolher o Local Apropriado

| Tipo de Conteúdo | Localização | Template |
|-------------------|-------------|----------|
| Novo módulo | `03-modules/[nome]/` | [MODULE_TEMPLATE.md](./03-modules/MODULE_TEMPLATE.md) |
| Guia técnico | `02-architecture/` | Estrutura livre |
| Manual usuário | `06-operations/user-manual/` | Estrutura livre |
| Regra de negócio | `05-business/` | Estrutura livre |
| Changelog | `07-changelog/[versão]/` | Template específico |

### 3. Usar Templates Apropriados

#### Para Módulos (OBRIGATÓRIO)
Use o **[MODULE_TEMPLATE.md](./03-modules/MODULE_TEMPLATE.md)** como base:

```bash
# Copie o template
cp docs/03-modules/MODULE_TEMPLATE.md docs/03-modules/[novo-modulo]/README.md

# Substitua os placeholders
# [MÓDULO_NOME] → Nome real do módulo
# [modulo] → nome em lowercase
# [Modulo] → Nome em PascalCase
```

#### Para Outras Seções
- **Mantenha consistência** com documentação existente
- **Use estrutura similar** ao README da seção
- **Inclua navegação** (links para docs relacionadas)

## ✍️ Padrões de Escrita

### Formatação Markdown

#### Títulos
```markdown
# 📚 Título Principal (H1) - Apenas um por documento
## 🎯 Seção Principal (H2) - Seções principais
### 📋 Subseção (H3) - Subdivisões
#### Detalhes (H4) - Detalhes específicos
```

#### Emojis Padrão
- 📚 📖 📋 📝 - Documentação geral
- 🎯 🏁 🚀 - Objetivos e metas
- 🏗️ ⚙️ 🔧 - Arquitetura e técnico
- 📊 💰 📈 - Negócio e métricas
- 🔒 🔐 🛡️ - Segurança
- ✅ ❌ 🚧 - Status
- 💡 ⚠️ 🚨 - Alertas e dicas

#### Code Blocks
```typescript
// Use syntax highlighting apropriado
const exemplo: TipoEspecifico = {
  propriedade: 'valor'
};
```

### Linguagem e Tom

#### Para Documentação Técnica
- **Objetiva e clara** - Evite prolixidade
- **Exemplos práticos** - Sempre incluir exemplos
- **Assumir conhecimento básico** - Para devs experientes

#### Para Documentação de Usuário
- **Linguagem simples** - Evite jargões técnicos
- **Passo a passo** - Instruções detalhadas
- **Screenshots quando útil** - Para clareza visual

#### Para Documentação de Negócio
- **Foco no valor** - Enfatize benefícios de negócio
- **Métricas e KPIs** - Dados quantificáveis
- **Linguagem executiva** - Para stakeholders

## 🔗 Sistema de Links

### Links Internos
```markdown
# Correto - Relativo à pasta docs
[Arquitetura](../02-architecture/README.md)
[Módulo Sales](./sales/README.md)

# Evitar - Links absolutos
[Não usar](/docs/02-architecture/README.md)
```

### Navegação Obrigatória
Cada documento deve incluir:
- **Links para documentação relacionada**
- **"Voltar para índice"** quando apropriado
- **"Próximos passos"** quando sequencial

### Âncoras e Referências
```markdown
# Use âncoras para seções longas
## 🎯 Seção Importante {#secao-importante}

# Referencie outras seções
Veja [Seção Importante](#secao-importante) para detalhes.
```

## 📝 Processo de Contribuição

### 1. Antes de Escrever
- [ ] Verifique se já existe documentação similar
- [ ] Identifique a seção apropriada
- [ ] Escolha o template correto
- [ ] Considere o público-alvo

### 2. Durante a Escrita
- [ ] Siga os padrões de formatação
- [ ] Use templates quando disponíveis
- [ ] Inclua exemplos práticos
- [ ] Adicione links de navegação

### 3. Antes de Finalizar
- [ ] Revise gramática e clareza
- [ ] Verifique todos os links
- [ ] Teste exemplos de código
- [ ] Atualize READMEs relacionados

### 4. Manutenção Contínua
- [ ] Atualize quando funcionalidades mudarem
- [ ] Remova informações obsoletas
- [ ] Mova conteúdo legado para `10-legacy/`

## 🎨 Padrões Visuais

### Tabelas
```markdown
| Coluna 1 | Coluna 2 | Status |
|----------|----------|--------|
| Item 1   | Valor 1  | ✅     |
| Item 2   | Valor 2  | ❌     |
```

### Alertas e Avisos
```markdown
> 💡 **Dica**: Informação útil para melhorar produtividade

> ⚠️ **Atenção**: Cuidado especial necessário

> 🚨 **Crítico**: Ação que pode afetar produção
```

### Status e Estados
```markdown
- **Status**: ✅ 100% Funcional
- **Status**: 🚧 Em Desenvolvimento
- **Status**: ❌ Descontinuado
```

## 🔄 Workflow de Atualização

### Mudanças Pequenas
1. Edite diretamente o arquivo
2. Atualize data de modificação
3. Verifique links relacionados

### Mudanças Grandes
1. Discuta a mudança primeiro
2. Considere impacto em outros docs
3. Atualize múltiplos arquivos se necessário
4. Documente no changelog se relevante

### Reestruturação
1. Mantenha arquivos antigos temporariamente
2. Crie redirects/avisos de migração
3. Atualize todas as referências
4. Mova conteúdo obsoleto para `10-legacy/`

## 📊 Qualidade da Documentação

### Checklist de Qualidade
- [ ] **Clareza** - Informação é compreensível
- [ ] **Completude** - Cobre todos os aspectos necessários
- [ ] **Atualidade** - Informação está atualizada
- [ ] **Navegabilidade** - Fácil de encontrar e navegar
- [ ] **Exemplos** - Inclui exemplos práticos
- [ ] **Links** - Todos os links funcionam

### Métricas de Sucesso
- **Feedback positivo** dos usuários da documentação
- **Redução de dúvidas** repetitivas
- **Tempo de onboarding** reduzido
- **Contribuições** frequentes da equipe

## 🛠️ Ferramentas Úteis

### Editores Recomendados
- **VS Code** com extensões Markdown
- **Typora** para preview em tempo real
- **GitBook** para documentação colaborativa

### Validação
- **Markdown linters** para formatação
- **Link checkers** para validar URLs
- **Spell checkers** para gramática

## 📞 Dúvidas e Suporte

### Para Contribuições
- **Consulte documentação existente** primeiro
- **Use templates apropriados**
- **Mantenha consistência** com padrões

### Para Estrutura
- **Siga a organização** por propósito
- **Use numeração sequencial**
- **Mantenha hierarquia clara**

---

**📝 Lembre-se**: Documentação é código! Trate com o mesmo cuidado e atenção que daria ao código da aplicação.

**🎯 Objetivo**: Documentação que **facilita** o trabalho, não que **complica**.

**✅ Sucesso**: Quando alguém consegue entender e usar o sistema apenas lendo a documentação.