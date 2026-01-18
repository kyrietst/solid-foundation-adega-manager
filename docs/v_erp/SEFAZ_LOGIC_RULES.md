# Regras Lógicas SEFAZ-SP & Nuvem Fiscal (NFC-e)

> **Documento Vivo:** Atualizado em 17/01/2026

## 1. O Problema do "vFrete" em São Paulo

A SEFAZ-SP (e outros estados) rejeita o campo `vFrete` (Valor do Frete) em notas
do modelo **NFC-e (65)**. Se você enviar esse campo preenchido, a nota será
rejeitada com erro de validação (Rejeição 323 ou similar dependendo do validador
local).

### Solução (Implementada no `fiscal-handler`):

Para contornar isso sem perder a cobrança da taxa de entrega, realizamos o
seguinte mapeamento no payload da nota:

| Conceito Real       | Campo NFC-e (XML) | Descrição                                               |
| :------------------ | :---------------- | :------------------------------------------------------ |
| **Taxa de Entrega** | `vOutro`          | O valor é somado no campo "Outras Despesas Acessórias". |
| **Frete Explicito** | `vFrete`          | Enviado sempre como `0.00`.                             |
| **Modalidade**      | `modFrete`        | Enviado sempre como `9` (Sem Frete) para consistência.  |

---

## 2. Distribuição Ponderada (Weighted Distribution)

O valor total da Taxa de Entrega (`vOutro`) e do Desconto (`vDesc`) deve ser
distribuído **item a item** para compor o XML. Simplesmente dividir pela
quantidade de itens gera erros de arredondamento (diferença de centavos) que
travam a validação de "Valor Total da Nota".

### Algoritmo de Distribuição

O código (`fiscal-handler/index.ts`) utiliza uma distribuição ponderada pelo
valor do item:

1. **Cálculo da Razão:** Para cada item, calculamos sua participação no valor
   total dos produtos. `Razão = (ValorTotalItem / ValorTotalProdutos)`
2. **Aplicação:** `ValorOutroItem = ValorTotalFrete * Razão`
3. **Arredondamento:** `.toFixed(2)` em cada passo.
4. **Acumulação e Correção do Último Item:** Para evitar sobras de dízima (ex:
   R$ 0,01 a mais ou a menos), o **último item** da lista não usa a fórmula de
   razão. Ele recebe: `ValorTotalFrete - SomaDoFreteDosItensAnteriores`

Isso garante que `Sum(Itens.vOutro) === Total.vOutro` com precisão matemática
absoluta.

---

## 3. Segurança de Dados (Validation Rules)

Para garantir que não estamos enviando lixo para a SEFAZ:

- **Valores Negativos:** `vOutro` e `vDesc` mapeados para `0.00` se forem `null`
  ou negativos.
- **Decimais:** Todos os valores monetários passam por
  `parseFloat(val.toFixed(2))` antes do envio.

## 4. Estrutura de Payload JSON (Referência)

Exemplo de como o JSON chega na Nuvem Fiscal após o processamento da Edge
Function:

```json
{
  "itens": [
    {
      "vProd": 10.00,
      "vFrete": 0.00, // Sempre Zero
      "vOutro": 2.50, // Parcela proporcional da entrega
      "vDesc": 0.00
    }
  ],
  "total": {
    "vNF": 12.50, // (vProd + vOutro - vDesc)
    "vFrete": 0.00,
    "vOutro": 2.50
  },
  "transp": {
    "modFrete": 9
  }
}
```
