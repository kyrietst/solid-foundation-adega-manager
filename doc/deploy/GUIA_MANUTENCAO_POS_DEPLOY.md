# 🚀 Guia de Manutenção Pós-Deploy - Adega Manager

**Para:** Desenvolvedor iniciante  
**Objetivo:** Manter o aplicativo funcionando sem quebrar a versão do cliente  
**Data:** 27 de agosto de 2025  

---

## 🎯 Situação Atual

Você tem:
- ✅ **Aplicativo funcionando** com dados reais (925+ registros)
- ✅ **Cliente testando** na adega dele
- ✅ **Uma versão no ar** que NÃO pode quebrar

**Problema:** Como fazer correções e melhorias sem afetar o cliente?

---

## 🏗️ Estrutura Recomendada (Simples)

### **2 Ambientes Separados:**

#### 🟢 **PRODUÇÃO** (Cliente usando)
- **GitHub**: Branch `main`
- **Vercel**: Projeto principal 
- **Supabase**: Banco atual (com dados reais do cliente)
- **Status**: NUNCA mexer diretamente!

#### 🟡 **DESENVOLVIMENTO** (Você testando)
- **GitHub**: Branch `desenvolvimento`
- **Vercel**: Projeto separado para testes
- **Supabase**: Banco separado (cópia dos dados)
- **Status**: Aqui você pode mexer à vontade

---

## 📋 Passo a Passo: Configuração Inicial

### **Etapa 1: Criar Branch de Desenvolvimento**

**O que fazer no terminal:**
```bash
# 1. Ir para a pasta do projeto
cd "sua-pasta-do-projeto"

# 2. Criar nova branch
git checkout -b desenvolvimento

# 3. Enviar para o GitHub
git push origin desenvolvimento
```

**Explicação simples:** Agora você tem 2 "versões" do código no GitHub.

### **Etapa 2: Criar Banco Separado no Supabase**

**No site do Supabase:**
1. **Acesse** [supabase.com](https://supabase.com)
2. **Clique** em "New Project"
3. **Nome:** `adega-manager-desenvolvimento`
4. **Região:** Mesma do projeto atual
5. **Aguarde** criação (2-3 minutos)

**Copiar estrutura do banco:**
1. **No projeto ATUAL** → Settings → Database
2. **Copie** todas as tabelas, policies e functions
3. **No projeto NOVO** → cole tudo
4. **Importe** alguns dados de exemplo (não todos os 925!)

### **Etapa 3: Criar Projeto Separado no Vercel**

**No site do Vercel:**
1. **Acesse** [vercel.com](https://vercel.com)
2. **Novo projeto** conectado ao GitHub
3. **Escolha** a branch `desenvolvimento`
4. **Nome:** `adega-manager-dev`
5. **Configure** as variáveis com o NOVO banco Supabase

---

## 🔄 Fluxo de Trabalho Diário

### **Para Fazer Correções/Melhorias:**

#### **Passo 1: Sempre Comece na Branch Desenvolvimento**
```bash
# Mude para branch desenvolvimento
git checkout desenvolvimento

# Puxe as últimas atualizações
git pull origin desenvolvimento
```

#### **Passo 2: Faça as Alterações**
- ✅ Edite os arquivos que precisar
- ✅ Teste no ambiente de desenvolvimento
- ✅ Verifique se tudo funciona

#### **Passo 3: Commite as Mudanças**
```bash
# Adicionar arquivos modificados
git add .

# Fazer commit com descrição clara
git commit -m "fix: correção do bug no relatório de vendas"

# Enviar para o GitHub
git push origin desenvolvimento
```

#### **Passo 4: Teste no Vercel Desenvolvimento**
- **Acesse** o site de desenvolvimento
- **Teste** todas as funcionalidades alteradas
- **Confirme** que não quebrou nada

#### **Passo 5: Só Depois Publique na Produção**
```bash
# Mude para branch principal
git checkout main

# Traga as correções da desenvolvimento
git merge desenvolvimento

# Envie para produção
git push origin main
```

**⚠️ ATENÇÃO:** O Vercel de produção vai atualizar automaticamente!

---

## 🚨 Regras de Ouro (NUNCA QUEBRE!)

### ❌ **NUNCA FAÇA:**
1. **Alterações diretas na branch `main`**
2. **Deploy direto sem testar**
3. **Mudanças no banco de produção**
4. **Delete dados reais do cliente**
5. **Teste coisas no site que o cliente usa**

### ✅ **SEMPRE FAÇA:**
1. **Teste na branch `desenvolvimento`**
2. **Confirme que funciona antes de publicar**
3. **Faça backup antes de mudanças grandes**
4. **Comunique o cliente sobre atualizações**
5. **Tenha um plano de volta caso dê problema**

---

## 🆘 Plano de Emergência

### **Se Algo Der Errado:**

#### **Problema: Site quebrou após atualização**
```bash
# Voltar para versão anterior (último commit que funcionava)
git checkout main
git reset --hard HEAD~1
git push --force origin main
```

#### **Problema: Banco de dados com problema**
1. **Acesse** Supabase → Database → Backups
2. **Restaure** backup mais recente
3. **Avise** o cliente do problema

#### **Problema: Cliente reporta bug urgente**
1. **Reproduza** no ambiente desenvolvimento
2. **Corrija** lá primeiro
3. **Teste** bastante
4. **Publique** só quando certeza

---

## 📞 Comunicação com o Cliente

### **Quando Avisar o Cliente:**

#### ✅ **SEMPRE avise sobre:**
- Novas funcionalidades importantes
- Correções de bugs que ele reportou
- Mudanças na interface
- Manutenções programadas

#### 💬 **Como avisar:**
```
"Olá! Fizemos uma atualização no sistema com:
- ✅ Correção do relatório de vendas
- ✅ Melhoria na velocidade dos gráficos

O sistema ficará offline por 2 minutos às 18h.
Qualquer problema, me avise!"
```

#### ❌ **NÃO precisa avisar sobre:**
- Correções internas de código
- Melhorias de performance
- Atualizações de segurança pequenas

---

## 🛠️ Comandos Úteis (Copie e Cole)

### **Situações Comuns:**

#### **Começar uma nova correção:**
```bash
git checkout desenvolvimento
git pull origin desenvolvimento
# ... faça suas alterações ...
git add .
git commit -m "fix: descreva o que corrigiu"
git push origin desenvolvimento
```

#### **Publicar correção em produção:**
```bash
git checkout main
git merge desenvolvimento
git push origin main
```

#### **Ver se tem diferenças entre desenvolvimento e produção:**
```bash
git checkout main
git diff desenvolvimento
```

#### **Voltar uma versão se deu problema:**
```bash
git checkout main
git reset --hard HEAD~1
git push --force origin main
```

---

## 📊 Monitoramento e Alertas

### **O que Acompanhar:**

#### **Diariamente:**
- ✅ **Vercel**: Site está online?
- ✅ **Supabase**: Banco funcionando?
- ✅ **Cliente**: Enviou algum feedback?

#### **Semanalmente:**
- ✅ **Performance**: Site está rápido?
- ✅ **Erros**: Logs do Vercel mostram problemas?
- ✅ **Backups**: Supabase está fazendo backup?

#### **Mensalmente:**
- ✅ **Uso**: Quantas pessoas usam o sistema?
- ✅ **Custos**: Vercel e Supabase cobrando quanto?
- ✅ **Atualizações**: Precisa atualizar bibliotecas?

### **Ferramentas Úteis:**
- **Vercel Analytics**: Para ver velocidade e erros
- **Supabase Dashboard**: Para monitorar o banco
- **GitHub Actions**: Para automatizar testes (futuro)

---

## 📚 Cenários Práticos

### **Cenário 1: Cliente reporta bug**

**Situação:** "Os gráficos não carregam no Chrome"

**Sua ação:**
1. **Reproduza** no ambiente desenvolvimento
2. **Identifique** o problema (ex: JavaScript quebrado)
3. **Corrija** no código
4. **Teste** no Chrome, Firefox, Safari
5. **Publique** a correção
6. **Confirme** com cliente que resolveu

### **Cenário 2: Quer adicionar nova funcionalidade**

**Situação:** Cliente quer "relatório de produtos mais vendidos"

**Sua ação:**
1. **Desenvolva** na branch desenvolvimento
2. **Teste** com dados de exemplo
3. **Mostre** pro cliente como ficou (screenshot)
4. **Aguarde** aprovação dele
5. **Publique** só após aprovação

### **Cenário 3: Erro crítico em produção**

**Situação:** Site parou de funcionar completamente

**Sua ação (URGENTE):**
1. **Imediatamente** volte versão anterior:
   ```bash
   git checkout main
   git reset --hard HEAD~1
   git push --force origin main
   ```
2. **Avise** cliente que está resolvendo
3. **Investigue** o problema no desenvolvimento
4. **Corrija** e teste bastante
5. **Publique** nova versão quando seguro

---

## 🎯 Dicas de Desenvolvedor Iniciante

### **Organize-se:**
- 📝 **Anote** todos os bugs/pedidos do cliente
- ⏰ **Reserve** horário fixo para manutenção
- 📱 **Configure** notificações de erro do Vercel
- 💾 **Sempre** faça backup antes de mudanças grandes

### **Comunique-se bem:**
- 🗣️ **Seja transparente** sobre prazos
- 📸 **Use screenshots** para explicar mudanças
- ⏱️ **Avise** quando houver manutenção
- 👂 **Escute** feedback do cliente

### **Aprenda continuamente:**
- 📖 **Documente** soluções que encontrou
- 🔍 **Google** é seu melhor amigo
- 💬 **Pergunte** em fóruns quando travado
- 🎓 **Estude** um pouco todo dia

---

## ✅ Checklist de Deploy

### **Antes de Publicar QUALQUER Mudança:**

#### **Testes Obrigatórios:**
- [ ] **Login funciona** com usuário de teste
- [ ] **Dashboard carrega** sem erros
- [ ] **PDV** consegue fazer uma venda
- [ ] **Relatórios** mostram dados corretos
- [ ] **Performance** está boa (< 3 segundos para carregar)

#### **Verificações Finais:**
- [ ] **Build** passa sem erros (`npm run build`)
- [ ] **Linting** não tem erros críticos (`npm run lint`)
- [ ] **Backup** do banco foi feito
- [ ] **Cliente** foi avisado sobre a atualização

#### **Pós-Deploy:**
- [ ] **Site** carregou corretamente
- [ ] **Funcionalidades** principais testadas
- [ ] **Cliente** confirmou que está funcionando
- [ ] **Logs** não mostram erros

---

## 📖 Glossário (Termos Simples)

**Branch:** "Versão" do seu código. Como ter duas pastas com o mesmo projeto.

**Commit:** Salvar uma mudança com uma descrição do que você fez.

**Deploy:** Colocar seu código no ar, no site que as pessoas acessam.

**Merge:** Juntar mudanças de uma branch com outra.

**Produção:** O site/sistema que o cliente está usando para trabalhar.

**Desenvolvimento:** Sua versão de testes, onde você mexe sem medo.

**Rollback:** Voltar para uma versão anterior quando algo dá errado.

**Environment Variables:** Configurações secretas (senhas, URLs do banco).

---

## 🚀 Próximos Passos

### **Semana 1 Pós-Deploy:**
1. ✅ **Configure** o ambiente de desenvolvimento
2. ✅ **Monitore** o uso do cliente
3. ✅ **Colete** feedback inicial
4. ✅ **Documente** problemas encontrados

### **Mês 1 Pós-Deploy:**
1. ✅ **Automatize** backups
2. ✅ **Configure** alertas de erro
3. ✅ **Otimize** performance baseado no uso real
4. ✅ **Planeje** próximas funcionalidades

### **Futuro:**
1. ✅ **Aprenda** sobre testes automatizados
2. ✅ **Configure** CI/CD para deploy automático
3. ✅ **Estude** monitoramento avançado
4. ✅ **Considere** ter um ambiente de homologação

---

## 📞 Contatos Úteis

**Em caso de emergência:**
- 🌐 **Vercel Support:** [vercel.com/help](https://vercel.com/help)
- 🗄️ **Supabase Support:** [supabase.com/support](https://supabase.com/support)
- 💻 **GitHub Support:** [support.github.com](https://support.github.com)

**Comunidades que ajudam:**
- 💬 **Stack Overflow:** Para erros de código
- 🐦 **Twitter Dev Community:** Para dicas rápidas
- 💻 **Discord de programação:** Para chat em tempo real

---

## 🎉 Conclusão

**Parabéns!** Você tem um sistema **real funcionando** com um **cliente real**. Isso é uma conquista enorme para um primeiro projeto!

**Lembre-se:**
- 🐢 **Vá devagar** - melhor funcionar bem do que quebrar
- 🧪 **Teste sempre** antes de publicar
- 📞 **Comunique-se** bem com o cliente
- 🎓 **Aprenda** com cada problema que resolver

**Você consegue!** Este é só o começo da sua carreira de desenvolvedor. 🚀

---

*Guia criado em 27/08/2025 - Adega Manager v2.6.0  
Mantenha este arquivo atualizado conforme aprende coisas novas!*