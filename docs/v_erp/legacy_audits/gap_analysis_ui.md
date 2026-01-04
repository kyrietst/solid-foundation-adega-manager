# 📊 Relatório de Aderência UI: Caderninho vs ERP

**Data:** 04/01/2026 **Status:** Análise Prévia

## 1. Cadastro de Produto

| Componente             | Campo Atual           | Status      | Recomendação ERP                              |
| :--------------------- | :-------------------- | :---------- | :-------------------------------------------- |
| `ProductBasicInfoCard` | L: "Nome do Produto"  | 🔴 Informal | Mudar para "Descrição (xProd)"                |
| `ProductBasicInfoCard` | L: "Código de Barras" | 🔴 Informal | Mudar para "GTIN/EAN (cEAN)"                  |
| `ProductPricingCard`   | L: "Preço de Venda"   | 🔴 Informal | Mudar para "Valor Unitário (vUnCom)"          |
| `ProductPricingCard`   | L: "Preço de Custo"   | 🔴 Informal | Mudar para "Custo Unitário"                   |
| `ProductFiscalCard`    | L: "NCM"              | 🟡 Parcial  | Exibir "Classificação Fiscal (NCM)" + Tooltip |
| `ProductFiscalCard`    | L: "CFOP"             | 🟡 Parcial  | Exibir "CFOP Padrão (5.102/5.405)"            |

## 2. Frente de Caixa (PDV)

| Componente     | Coluna/Label Atual         | Status      | Recomendação ERP                                |
| :------------- | :------------------------- | :---------- | :---------------------------------------------- |
| `CartItemList` | (Header implícito "Preço") | 🔴 Informal | Header explícito: "Vlr. Unit."                  |
| `CartItemList` | (Header implícito "Total") | 🔴 Informal | Header explícito: "Vlr. Total"                  |
| `ReceiptModal` | Col: "ITEM"                | 🟡 Genérico | "DESCRIÇÃO / CÓDIGO"                            |
| `ReceiptModal` | Col: "VALOR"               | 🔴 Informal | "VLR. UNIT / VLR. TOTAL"                        |
| `ReceiptModal` | Label: "Total"             | 🟢 OK       | Manter (Usuário final entende melhor que vProd) |

## 3. Conclusão

**Nível de Maturidade Atual: Baixo (Conceitual "Caderninho")**

A interface atual utiliza terminologia amigável para leigos ("Preço", "Nome"), o
que facilita a entrada, mas cria atrito cognitivo com a realidade fiscal ("Valor
Unitário", "Descrição", "xProd").

**Recomendação Estratégica:** Adotar uma abordagem híbrida: Manter labels
principais amigáveis mas adicionar "Technical Subtext" (ex: Label diz "Preço de
Venda", mas um caption menor diz "vUnCom"). Para campos críticos como NCM e EAN,
usar a terminologia fiscal estrita para educar o usuário.
