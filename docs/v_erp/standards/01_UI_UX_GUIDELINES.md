# 01. UI/UX Guidelines & Component Standards

This document defines the visual language and interaction patterns for Adega
Manager (Premium ERP).

## 1. Patterns de Navegação (Sidebar)

A Sidebar é o principal meio de navegação e deve seguir o padrão **Collapsible
Grouping** (Shadcn/UI).

- **Estrutura:** Ícones à esquerda, Rótulos claros.
- **Grupos:** "Frente de Loja", "Estoque & Compras", "Gestão", "Sistema".
- **Comportamento:**
  - **Expandida:** Mostra grupos colapsáveis (Accordions).
  - **Colapsada:** Mostra apenas ícones em lista plana (Flat List).
  - **Micro-interações:** Setas (Chevrons) rotacionam 90º ao abrir/fechar.
- **Estado Inicial:** O primeiro grupo ("Frente de Loja") deve vir aberto por
  padrão.

---

## 2. Card Design (Glassmorphism)

We use a subtle Glassmorphism effect to convey a premium feel.

- **Background:** `bg-black/40` matches `slate-950` deeply.
- **Border:** `border-white/10`.
- **Blur:** `backdrop-blur-md`.
- **Shadow:** `shadow-xl`.

### Exemplo de Uso:

```tsx
import { getGlassCardClasses } from "@/core/config/theme-utils";

<Card className={cn(getGlassCardClasses(), "p-6")}>
  <CardTitle className="text-white">Relatório Premium</CardTitle>
</Card>;
```

---

## 3. Cores e Tipografia

### Fontes

- **Principal:** `Inter` (UI Geral).
- **Números/Tables:** `SF Pro` ou `Outfit` (Monospaced feeling).
- **Títulos:** `Outfit` (Premium).

### Paleta (Tailwind Config)

- **Primary:** `purple-500` (Ações principais).
- **Background:** `slate-950` (Fundo global).
- **Surface:** `black/40` (Cards).
- **Success:** `emerald-500`.
- **Destructive:** `red-500`.

---

## 4. Componentes Críticos

### A. Tabelas

- **Header:** Fixo, fundo `black/20`, texto cinza claro.
- **Rows:** Hover effect `hover:bg-purple-500/5`.
- **Empty State:** Nunca mostre apenas um header vazio. Use o componente
  `<EmptyState />`.

### B. Modais (`Dialog`)

- **Overlay:** Backdrop blur (`backdrop-blur-sm`).
- **Animação:** `AnimatePresence` do Framer Motion. Entra suavemente
  (`opacity-0` -> `opacity-100` + `scale-95` -> `scale-100`).

### C. Feedback (`Sonner`)

- **Success:** `toast.success('Salvo com sucesso')` (Verde).
- **Error:** `toast.error('Erro ao conectar')` (Vermelho).
- **Posição:** Top Right.

---

## 5. Terminologia (Glossário Enterprise)

| Termo Proibido ❌ | Termo Correto ✅         | Contexto                             |
| :---------------- | :----------------------- | :----------------------------------- |
| Criar             | Lançar / Registrar       | Ações financeiras                    |
| Apagar            | Arquivar / Estornar      | Dados sensíveis (Soft Delete)        |
| Motoqueiro        | Entregador / Logística   | App de Entregas                      |
| Lucro             | Margem                   | Relatórios                           |
| Configs           | Parâmetros               | Menu de Sistema                      |
| Fiado / Pendura   | Conta Assinada / Crédito | Frente de Caixa (Interno vs Cliente) |
| Pagar             | Quitar / Liquidar        | Baixa de Dívidas                     |

_Consulte a matriz completa em `FULL_UI_CONSISTENCY_MATRIX.md` (Legado, mas
válido)._
