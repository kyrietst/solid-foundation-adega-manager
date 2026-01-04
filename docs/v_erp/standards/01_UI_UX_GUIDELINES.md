# 01. UI/UX Guidelines & Visual Identity

> [!IMPORTANT]
> O AdegaManager utiliza um design system "Premium/Glassmorphism". **Não crie
> estilos inline.** Siga estritamente os padrões abaixo.

## 1. Stack Visual

- **CSS Framework:** Tailwind CSS.
- **Component Library:** Shadcn UI (Radix Primitives).
- **Motion:** Framer Motion (obrigatório para modais e transições).
- **Icons:** Lucide React (Stroke width: 2px padrão).

---

## 2. O Padrão "Glassmorphism"

Nossa identidade visual se baseia em camadas translúcidas sobre um fundo
escuro/vibrante.

### Classes Utilitárias (`theme-utils.ts`)

Para manter consistência, abstraímos as classes longas do Tailwind em helpers.
**USE ESTES HELPERS, NÃO REINVENTE A RODA.**

| Helper                           | Uso                          | Exemplo Visual                                                       |
| :------------------------------- | :--------------------------- | :------------------------------------------------------------------- |
| `getGlassCardClasses()`          | Todo Card principal de fundo | Fundo preto translúcido, borda fina branca/10                        |
| `getGlassButtonClasses(variant)` | Botões de ação               | `primary` (Roxo Sólido), `secondary` (Glass), `outline` (Borda Roxo) |
| `getHoverTransformClasses()`     | Interatividade               | `scale` (leve zoom) ou `lift` (elevação)                             |

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

| Termo Proibido ❌ | Termo Correto ✅       | Contexto                      |
| :---------------- | :--------------------- | :---------------------------- |
| Criar             | Lançar / Registrar     | Ações financeiras             |
| Apagar            | Arquivar / Estornar    | Dados sensíveis (Soft Delete) |
| Motoqueiro        | Entregador / Logística | App de Entregas               |
| Lucro             | Margem                 | Relatórios                    |
| Configs           | Parâmetros             | Menu de Sistema               |

_Consulte a matriz completa em `FULL_UI_CONSISTENCY_MATRIX.md` (Legado, mas
válido)._
