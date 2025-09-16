/**
 * Design System Page - Documentação viva completa
 * Demonstra TODOS os elementos visuais do Adega Manager
 * 
 * @author Adega Manager Team
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Button } from '@/shared/ui/primitives/button';
import { Badge } from '@/shared/ui/primitives/badge';
import { 
  Palette, 
  Type, 
  MousePointer, 
  Layout, 
  Sparkles,
  Code2,
  Copy,
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package, 
  TrendingUp, 
  AlertTriangle,
  BarChart3,
  PieChart,
  LineChart,
  Calendar,
  Info,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  ExternalLink,
  Store,
  Truck,
  CreditCard,
  Search,
  UserPlus,
  Trash2,
  Eye,
  FileText,
  Loader2,
  Building2,
  Plus,
  Minus,
  Crown,
  UserCheck,
  Brain,
  Tag,
  Target,
  Gift,
  Cake,
  Settings,
  Download,
  ChevronDown,
  MessageSquare,
  MapPin,
  RefreshCw,
  Filter,
  Navigation,
  Phone,
  Package2,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  RotateCcw,
  Bot,
  Zap,
  Lightbulb,
  Activity,
  CheckCircle,
  Clock,
  FileSpreadsheet,
  Calculator,
  Percent,
  BarChart4,
  Receipt,
  KeyRound
} from 'lucide-react';
import { cn } from '@/core/config/utils';
import { 
  getSFProTextClasses, 
  getGlassCardClasses, 
  getIconClasses,
  getHeaderTextClasses,
  getBadgeClasses,
  getGlassButtonClasses
} from '@/core/config/theme-utils';
import { BlurIn } from '@/shared/ui/effects/blur-in';
import { StatCard } from '@/shared/ui/composite/stat-card';
import { SparklesText } from '@/components/ui/sparkles-text';
import { GradualSpacing } from '@/components/ui/gradual-spacing';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart as RechartsBarChart, Bar } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/primitives/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/shared/ui/primitives/sheet';
import { Input } from '@/shared/ui/primitives/input';
import { ScrollArea } from '@/shared/ui/primitives/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/primitives/dialog';

// Seções do Design System
const designSystemSections = [
  {
    id: 'colors',
    title: 'Paleta de Cores',
    description: '74+ cores do sistema Adega Wine Cellar',
    icon: Palette,
    color: 'text-primary-yellow'
  },
  {
    id: 'typography',
    title: 'Tipografia',
    description: 'SF Pro Display - 9 variações + hierarquias',
    icon: Type,
    color: 'text-accent-blue'
  },
  {
    id: 'buttons',
    title: 'Botões & Controles',
    description: '38 utilitários + estados interativos',
    icon: MousePointer,
    color: 'text-accent-green'
  },
  {
    id: 'components',
    title: 'Componentes de Dados',
    description: 'Cards, tabelas, gráficos, KPIs',
    icon: Layout,
    color: 'text-accent-purple'
  },
  {
    id: 'charts',
    title: 'Visualização de Dados',
    description: 'Recharts, tooltips, formatters, interações',
    icon: BarChart3,
    color: 'text-amber-400'
  },
  {
    id: 'interactive',
    title: 'Componentes Interativos',
    description: 'Carousels, selectors, alerts, controles',
    icon: MousePointer,
    color: 'text-cyan-400'
  },
  {
    id: 'states',
    title: 'Estados de Interface',
    description: 'Loading, hover effects, progress, animações',
    icon: Sparkles,
    color: 'text-green-400'
  },
  {
    id: 'pos',
    title: 'POS & E-commerce',
    description: 'Carrinho, pagamento, busca, layout de vendas',
    icon: ShoppingCart,
    color: 'text-yellow-400'
  },
  {
    id: 'inventory',
    title: 'Inventory & Stock',
    description: 'Estoque, códigos de barras, análise de giro',
    icon: Package,
    color: 'text-purple-400'
  },
  {
    id: 'suppliers',
    title: 'Suppliers & Vendors',
    description: 'Fornecedores, parceiros, gestão comercial',
    icon: Building2,
    color: 'text-indigo-400'
  },
  {
    id: 'customers',
    title: 'Customers & CRM',
    description: 'Clientes, segmentação, insights IA, tags',
    icon: Users,
    color: 'text-cyan-400'
  },
  {
    id: 'crm-dashboard',
    title: 'CRM Dashboard',
    description: 'Dashboard avançado, calendário, export, animações',
    icon: PieChart,
    color: 'text-emerald-400'
  },
  {
    id: 'delivery',
    title: 'Delivery & Logistics',
    description: 'Timeline, status tracking, KPIs, workflow',
    icon: Truck,
    color: 'text-orange-400'
  },
  {
    id: 'movements',
    title: 'Movimentações',
    description: 'Data tables, badges, forms condicionais, tracking',
    icon: Package2,
    color: 'text-purple-400'
  },
  {
    id: 'automations',
    title: 'Automações & Workflows',
    description: 'Tabs gradientes, cards de automação, métricas IA',
    icon: Bot,
    color: 'text-purple-400'
  },
  {
    id: 'reports',
    title: 'Relatórios & Analytics',
    description: 'DRE, charts avançados, tabelas, filtros, export',
    icon: FileText,
    color: 'text-blue-400'
  },
  {
    id: 'expenses',
    title: 'Gestão de Despesas',
    description: 'Gradientes RY, spotlight hero, KPIs financeiros, filtros avançados',
    icon: Receipt,
    color: 'text-red-400'
  },
  {
    id: 'users',
    title: 'Sistema de Usuários',
    description: 'First admin setup, role badges, advanced table, confirmações',
    icon: Crown,
    color: 'text-amber-400'
  },
  {
    id: 'layouts',
    title: 'Layouts Avançados',
    description: 'Glass morphism, grids, responsive patterns',
    icon: Layout,
    color: 'text-accent-red'
  },
  {
    id: 'animations',
    title: 'Efeitos & Animações',
    description: 'Hover, glow, transforms, Aceternity UI',
    icon: Sparkles,
    color: 'text-primary-yellow'
  }
];

export default function DesignSystemPage() {
  const [activeSection, setActiveSection] = useState('colors');
  const [showCode, setShowCode] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black">
      {/* Header Principal */}
      <div className="relative">
        {/* Efeito de brilho de fundo */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-yellow/5 via-accent-purple/10 to-primary-yellow/5 blur-3xl" />
        
        <div className="relative bg-black/80 backdrop-blur-sm border-b border-white/20 p-6">
          <div className="max-w-7xl mx-auto">
            <BlurIn
              word="DESIGN SYSTEM"
              duration={1.2}
              variant={{
                hidden: { filter: "blur(15px)", opacity: 0 },
                visible: { filter: "blur(0px)", opacity: 1 }
              }}
              className={cn(
                getHeaderTextClasses('main'),
                "text-transparent bg-clip-text bg-gradient-to-r from-[#FF2400] via-[#FFDA04] to-[#FF2400] text-center mb-4 drop-shadow-lg"
              )}
              style={{
                textShadow: '0 2px 4px rgba(0,0,0,0.3), 0 0 20px rgba(255, 218, 4, 0.2)'
              }}
            />
            
            <p className={cn(
              getSFProTextClasses('body', 'secondary'),
              'text-center max-w-3xl mx-auto'
            )}>
              Documentação viva de todos os elementos visuais do sistema Adega Manager. 
              Referência completa para desenvolvimento de agentes e padronização.
            </p>

            {/* Toggle Code View - Funcional para o design system */}
            <div className="flex justify-center mt-6">
              <Button
                variant={showCode ? "default" : "outline"}
                onClick={() => setShowCode(!showCode)}
                className={cn(
                  "border border-primary-yellow/30 text-primary-yellow",
                  showCode && "bg-primary-yellow text-black"
                )}
              >
                <Code2 className="w-4 h-4 mr-2" />
                {showCode ? 'Ocultar Código' : 'Mostrar Código'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar de Navegação */}
        <div className="lg:col-span-1">
          <Card className={getGlassCardClasses('default')}>
            <CardHeader>
              <CardTitle className={getSFProTextClasses('h4', 'accent')}>
                Navegação Interna
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {designSystemSections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      'w-full text-left p-3 rounded-lg transition-all duration-200 group',
                      activeSection === section.id
                        ? 'bg-primary-yellow/10 border border-primary-yellow/30'
                        : 'hover:bg-gray-800/60 border border-transparent'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className={cn(
                          'w-4 h-4',
                          activeSection === section.id ? 'text-primary-yellow' : section.color
                        )} />
                        <div>
                          <p className={cn(
                            getSFProTextClasses('label'),
                            activeSection === section.id ? 'text-primary-yellow' : 'text-gray-100'
                          )}>
                            {section.title}
                          </p>
                          <p className={getSFProTextClasses('caption', 'secondary')}>
                            {section.description}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className={cn(
                        'w-4 h-4 transition-transform duration-200',
                        activeSection === section.id ? 'rotate-90 text-primary-yellow' : 'text-gray-400'
                      )} />
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Área Principal de Conteúdo */}
        <div className="lg:col-span-3">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Renderizar seção ativa */}
            {activeSection === 'colors' && <ColorPaletteSection showCode={showCode} />}
            {activeSection === 'typography' && <TypographySection showCode={showCode} />}
            {activeSection === 'buttons' && <ButtonsSection showCode={showCode} />}
            {activeSection === 'components' && <ComponentsSection showCode={showCode} />}
            {activeSection === 'charts' && <ChartsSection showCode={showCode} />}
            {activeSection === 'interactive' && <InteractiveSection showCode={showCode} />}
            {activeSection === 'states' && <StatesSection showCode={showCode} />}
            {activeSection === 'pos' && <POSSection showCode={showCode} />}
            {activeSection === 'inventory' && <InventorySection showCode={showCode} />}
            {activeSection === 'suppliers' && <SuppliersSection showCode={showCode} />}
            {activeSection === 'customers' && <CustomersSection showCode={showCode} />}
            {activeSection === 'crm-dashboard' && <CrmDashboardSection showCode={showCode} />}
            {activeSection === 'delivery' && <DeliverySection showCode={showCode} />}
            {activeSection === 'movements' && <MovementsSection showCode={showCode} />}
            {activeSection === 'automations' && <AutomationsSection showCode={showCode} />}
            {activeSection === 'reports' && <ReportsSection showCode={showCode} />}
            {activeSection === 'expenses' && <ExpensesSection showCode={showCode} />}
            {activeSection === 'users' && <UsersSection showCode={showCode} />}
            {activeSection === 'layouts' && <LayoutsSection showCode={showCode} />}
            {activeSection === 'animations' && <AnimationsSection showCode={showCode} />}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SEÇÕES DO DESIGN SYSTEM
// ============================================================================

function ColorPaletteSection({ showCode }: { showCode: boolean }) {
  return (
    <div className="space-y-6">
      <Card className={getGlassCardClasses('premium')}>
        <CardHeader>
          <CardTitle className={getSFProTextClasses('h3', 'accent')}>
            🎨 Paleta de Cores Completa
          </CardTitle>
          <p className={getSFProTextClasses('body', 'secondary')}>
            Sistema de cores Adega Wine Cellar - 74+ cores organizadas por categoria
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Cores Primárias */}
            <ColorGroup 
              title="Cores Primárias" 
              colors={[
                { name: 'primary-black', value: '#000000', var: 'bg-primary-black' },
                { name: 'primary-yellow', value: '#FFD700', var: 'bg-primary-yellow' }
              ]} 
            />

            {/* Escala Black */}
            <ColorGroup 
              title="Escala Black" 
              colors={[
                { name: 'black-100', value: '#000000', var: 'bg-black-100' },
                { name: 'black-90', value: '#1a1a1a', var: 'bg-black-90' },
                { name: 'black-80', value: '#333333', var: 'bg-black-80' },
                { name: 'black-70', value: '#4a4a4a', var: 'bg-black-70' },
                { name: 'black-60', value: '#666666', var: 'bg-black-60' }
              ]} 
            />

            {/* Escala Yellow */}
            <ColorGroup 
              title="Escala Yellow" 
              colors={[
                { name: 'yellow-100', value: '#FFD700', var: 'bg-yellow-100' },
                { name: 'yellow-90', value: '#FFC107', var: 'bg-yellow-90' },
                { name: 'yellow-80', value: '#FFB300', var: 'bg-yellow-80' },
                { name: 'yellow-70', value: '#FF8F00', var: 'bg-yellow-70' },
                { name: 'yellow-60', value: '#FF6F00', var: 'bg-yellow-60' }
              ]} 
            />

            {/* Neutrals Profissionais */}
            <ColorGroup 
              title="Neutrals (gray-950 → gray-50)" 
              colors={[
                { name: 'gray-950', value: '#030712', var: 'bg-gray-950' },
                { name: 'gray-900', value: '#111827', var: 'bg-gray-900' },
                { name: 'gray-800', value: '#1f2937', var: 'bg-gray-800' },
                { name: 'gray-700', value: '#374151', var: 'bg-gray-700' },
                { name: 'gray-600', value: '#4b5563', var: 'bg-gray-600' },
                { name: 'gray-500', value: '#6b7280', var: 'bg-gray-500' },
                { name: 'gray-400', value: '#9ca3af', var: 'bg-gray-400' },
                { name: 'gray-300', value: '#d1d5db', var: 'bg-gray-300' },
                { name: 'gray-200', value: '#e5e7eb', var: 'bg-gray-200' },
                { name: 'gray-100', value: '#f3f4f6', var: 'bg-gray-100' },
                { name: 'gray-50', value: '#f9fafb', var: 'bg-gray-50' }
              ]} 
            />

            {/* Accents Modernos */}
            <ColorGroup 
              title="Modern Accents" 
              colors={[
                { name: 'accent-green', value: '#10b981', var: 'bg-accent-green' },
                { name: 'accent-red', value: '#ef4444', var: 'bg-accent-red' },
                { name: 'accent-blue', value: '#3b82f6', var: 'bg-accent-blue' },
                { name: 'accent-purple', value: '#a855f7', var: 'bg-accent-purple' },
                { name: 'accent-orange', value: '#f97316', var: 'bg-accent-orange' },
                { name: 'accent-teal', value: '#14b8a6', var: 'bg-accent-teal' }
              ]} 
            />

            {/* Adega Wine Cellar */}
            <ColorGroup 
              title="Adega Wine Cellar (12 cores)" 
              colors={[
                { name: 'adega-bordeaux', value: '#722f37', var: 'bg-adega-bordeaux' },
                { name: 'adega-burgundy', value: '#800020', var: 'bg-adega-burgundy' },
                { name: 'adega-merlot', value: '#4a0e0e', var: 'bg-adega-merlot' },
                { name: 'adega-cabernet', value: '#331416', var: 'bg-adega-cabernet' },
                { name: 'adega-rosé', value: '#ffc0cb', var: 'bg-adega-rosé' },
                { name: 'adega-champagne', value: '#f7e7ce', var: 'bg-adega-champagne' },
                { name: 'adega-chardonnay', value: '#fffdd0', var: 'bg-adega-chardonnay' },
                { name: 'adega-sauvignon', value: '#9acd32', var: 'bg-adega-sauvignon' },
                { name: 'adega-riesling', value: '#e6e6fa', var: 'bg-adega-riesling' },
                { name: 'adega-barolo', value: '#2f1b14', var: 'bg-adega-barolo' },
                { name: 'adega-chianti', value: '#8b0000', var: 'bg-adega-chianti' },
                { name: 'adega-vintage', value: '#4b0000', var: 'bg-adega-vintage' }
              ]} 
            />

            {/* Surface Variants */}
            <ColorGroup 
              title="Surface Variants" 
              colors={[
                { name: 'adega-charcoal', value: '#1e1e1e', var: 'bg-adega-charcoal' },
                { name: 'adega-platinum', value: '#c0c0c0', var: 'bg-adega-platinum' },
                { name: 'adega-obsidian', value: '#0a0a0a', var: 'bg-adega-obsidian' },
                { name: 'adega-graphite', value: '#383838', var: 'bg-adega-graphite' }
              ]} 
            />
          </div>

          {showCode && (
            <div className="mt-6 p-4 bg-gray-900/60 border border-gray-700 rounded-lg">
              <pre className={getSFProTextClasses('small')}>
{`// Usando as cores no código
className="bg-primary-yellow text-primary-black"
className="border border-yellow-80/30" 
className="text-accent-green"

// Headers com gradiente padrão Adega:
className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF2400] via-[#FFDA04] to-[#FF2400]"

// Hexadecimais do sistema:
#FF2400 - Vermelho Adega (Primary)
#FFDA04 - Amarelo Adega (Secondary)`}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function TypographySection({ showCode }: { showCode: boolean }) {
  return (
    <div className="space-y-6">
      <Card className={getGlassCardClasses('default')}>
        <CardHeader>
          <CardTitle className={getSFProTextClasses('h3', 'accent')}>
            📝 Sistema de Tipografia
          </CardTitle>
          <p className={getSFProTextClasses('body', 'secondary')}>
            SF Pro Display - Todas as variações e hierarquias disponíveis
          </p>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Hierarquias Completas */}
          <div>
            <h4 className={getSFProTextClasses('h4', 'accent')}>Todas as Hierarquias SF Pro Display</h4>
            <div className="space-y-4 mt-4">
              <TypographyExample 
                text="Título Principal - SF Pro Black 30px" 
                className={getSFProTextClasses('h1')} 
                code="getSFProTextClasses('h1')" 
                showCode={showCode} 
              />
              <TypographyExample 
                text="Subtítulo Importante - SF Pro Bold 20-32px" 
                className={getSFProTextClasses('h2')} 
                code="getSFProTextClasses('h2')" 
                showCode={showCode} 
              />
              <TypographyExample 
                text="Título de Seção - SF Pro SemiBold 18-24px" 
                className={getSFProTextClasses('h3')} 
                code="getSFProTextClasses('h3')" 
                showCode={showCode} 
              />
              <TypographyExample 
                text="Labels Importantes - SF Pro Medium 16-20px" 
                className={getSFProTextClasses('h4')} 
                code="getSFProTextClasses('h4')" 
                showCode={showCode} 
              />
              <TypographyExample 
                text="Texto do corpo - SF Pro Regular 14-16px" 
                className={getSFProTextClasses('body')} 
                code="getSFProTextClasses('body')" 
                showCode={showCode} 
              />
              <TypographyExample 
                text="Metadados - SF Pro Medium 12-14px" 
                className={getSFProTextClasses('caption')} 
                code="getSFProTextClasses('caption')" 
                showCode={showCode} 
              />
              <TypographyExample 
                text="Informações auxiliares - SF Pro Regular 12px" 
                className={getSFProTextClasses('small')} 
                code="getSFProTextClasses('small')" 
                showCode={showCode} 
              />
              <TypographyExample 
                text="Valores numéricos - SF Pro Bold 20-32px" 
                className={getSFProTextClasses('value')} 
                code="getSFProTextClasses('value')" 
                showCode={showCode} 
              />
              <TypographyExample 
                text="Labels de interface - SF Pro Medium 14-16px" 
                className={getSFProTextClasses('label')} 
                code="getSFProTextClasses('label')" 
                showCode={showCode} 
              />
              <TypographyExample 
                text="Texto de ação - SF Pro SemiBold 14-16px" 
                className={getSFProTextClasses('action')} 
                code="getSFProTextClasses('action')" 
                showCode={showCode} 
              />
              <TypographyExample 
                text="STATUS/BADGES - SF PRO MEDIUM 12-14PX" 
                className={getSFProTextClasses('status')} 
                code="getSFProTextClasses('status')" 
                showCode={showCode} 
              />
            </div>
          </div>

          {/* Pesos SF Pro Display */}
          <div>
            <h4 className={getSFProTextClasses('h4', 'accent')}>9 Pesos SF Pro Display</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {[
                { weight: 'thin', label: 'Thin (100)', usage: 'Ultra leve - decorativo' },
                { weight: 'ultralight', label: 'Ultralight (200)', usage: 'Muito leve - decorativo' },
                { weight: 'light', label: 'Light (300)', usage: 'Leve - texto auxiliar' },
                { weight: 'regular', label: 'Regular (400)', usage: 'Normal - texto padrão' },
                { weight: 'medium', label: 'Medium (500)', usage: 'Médio - labels, captions' },
                { weight: 'semibold', label: 'SemiBold (600)', usage: 'Semi-negrito - ações' },
                { weight: 'bold', label: 'Bold (700)', usage: 'Negrito - valores, títulos' },
                { weight: 'heavy', label: 'Heavy (800)', usage: 'Pesado - títulos grandes' },
                { weight: 'black', label: 'Black (900)', usage: 'Ultra pesado - principais' }
              ].map((item) => (
                <div key={item.weight} className="p-4 border border-gray-700/50 rounded-lg">
                  <div className={`font-sf-${item.weight} text-lg`}>
                    {item.label}
                  </div>
                  <p className={getSFProTextClasses('caption', 'secondary')}>
                    {item.usage}
                  </p>
                  {showCode && (
                    <code className="text-xs text-gray-400 block mt-2">
                      getSFProWeightClasses('{item.weight}')
                    </code>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Variantes de Cor */}
          <div>
            <h4 className={getSFProTextClasses('h4', 'accent')}>Variantes de Cor</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {[
                { variant: 'primary', color: 'text-primary-yellow' },
                { variant: 'secondary', color: 'text-gray-300' },
                { variant: 'accent', color: 'text-primary-yellow' },
                { variant: 'success', color: 'text-accent-green' },
                { variant: 'warning', color: 'text-primary-yellow' },
                { variant: 'error', color: 'text-accent-red' },
                { variant: 'purple', color: 'text-accent-purple' },
                { variant: 'neutral', color: 'text-gray-100' }
              ].map((item) => (
                <div key={item.variant} className="p-4 border border-gray-700/50 rounded-lg">
                  <div className={getSFProTextClasses('h4', item.variant as any)}>
                    Texto {item.variant}
                  </div>
                  <p className={cn(getSFProTextClasses('caption'), item.color)}>
                    {item.color}
                  </p>
                  {showCode && (
                    <code className="text-xs text-gray-400 block mt-2">
                      getSFProTextClasses('h4', '{item.variant}')
                    </code>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Tipografia Especializada */}
          <div>
            <h4 className={getSFProTextClasses('h4', 'accent')}>Tipografia Especializada</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {/* KPIs */}
              <div className="p-4 border border-accent-green/30 rounded-lg">
                <h5 className="text-accent-green font-sf-medium text-sm mb-3">KPIs & Métricas</h5>
                <div className="space-y-2">
                  <div className="font-sf-medium text-sm text-gray-400">Vendas Hoje</div>
                  <div className="font-sf-bold text-2xl text-white">R$ 2.847,90</div>
                  <div className="font-sf-medium text-xs text-accent-green">+12.5%</div>
                  <div className="font-sf-regular text-xs text-gray-400">vs. ontem</div>
                </div>
                {showCode && (
                  <code className="text-xs text-gray-400 block mt-2">
                    getKPITextClasses('title'|'value'|'delta'|'subtitle')
                  </code>
                )}
              </div>

              {/* Headers */}
              <div className="p-4 border border-primary-yellow/30 rounded-lg">
                <h5 className="text-primary-yellow font-sf-medium text-sm mb-3">Headers de Páginas - Padrão Adega</h5>
                <div className="space-y-4">
                  <div>
                    <div className="font-sf-black text-3xl text-transparent bg-clip-text bg-gradient-to-r from-[#FF2400] via-[#FFDA04] to-[#FF2400] drop-shadow-lg">
                      DASHBOARD
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Header principal (#FF2400 → #FFDA04 → #FF2400)</p>
                  </div>
                  <div>
                    <div className="font-sf-black text-3xl text-transparent bg-clip-text bg-gradient-to-r from-[#FF2400] via-[#FFDA04] to-[#FF2400] drop-shadow-lg">
                      VENDAS
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Mesmo padrão usado em todas as páginas</p>
                  </div>
                  <div>
                    <div className="font-sf-black text-3xl text-transparent bg-clip-text bg-gradient-to-r from-[#FF2400] via-[#FFDA04] to-[#FF2400] drop-shadow-lg">
                      ESTOQUE
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Vermelho Adega → Amarelo Adega → Vermelho Adega</p>
                  </div>
                </div>
                {showCode && (
                  <code className="text-xs text-gray-400 block mt-4 p-3 bg-gray-900/60 rounded">
{`// Header principal - PADRÃO ADEGA (usado em todas as páginas)
className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF2400] via-[#FFDA04] to-[#FF2400] drop-shadow-lg"

// Cores exatas do sistema:
--adega-red: #FF2400    // Vermelho Adega (Primary)
--adega-yellow: #FFDA04 // Amarelo Adega (Secondary)

// Com BlurIn animation:
<BlurIn
  word="SEU TÍTULO"
  duration={1.2}
  className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF2400] via-[#FFDA04] to-[#FF2400] drop-shadow-lg"
  style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3), 0 0 20px rgba(255, 218, 4, 0.2)' }}
/>`}
                  </code>
                )}
              </div>

              {/* Sublinhado Elegante */}
              <div className="p-4 border border-accent-red/30 rounded-lg">
                <h5 className="text-accent-red font-sf-medium text-sm mb-3">Sublinhado Elegante - 4 Camadas</h5>
                <div className="space-y-6">
                  {/* Demonstração visual */}
                  <div className="text-center">
                    <div className="font-sf-black text-2xl text-transparent bg-clip-text bg-gradient-to-r from-[#FF2400] via-[#FFDA04] to-[#FF2400] drop-shadow-lg inline-block">
                      EXEMPLO COMPLETO
                    </div>
                    
                    {/* Sublinhado de 4 camadas */}
                    <div className="w-full h-6 relative mt-2 max-w-md mx-auto">
                      {/* Camada 1: Vermelho com blur */}
                      <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FF2400]/80 to-transparent h-[2px] w-full blur-sm" />
                      
                      {/* Camada 2: Vermelho sólido */}
                      <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FF2400] to-transparent h-px w-full" />
                      
                      {/* Camada 3: Amarelo com blur (menor largura) */}
                      <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FFDA04]/80 to-transparent h-[3px] w-3/4 blur-sm mx-auto" />
                      
                      {/* Camada 4: Amarelo sólido (menor largura) */}
                      <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FFDA04] to-transparent h-px w-3/4 mx-auto" />
                    </div>
                  </div>

                  {/* Especificações */}
                  <div>
                    <h6 className="text-accent-red font-sf-medium text-xs mb-2">Especificações Técnicas</h6>
                    <ul className="text-xs text-gray-300 space-y-1">
                      <li>• <strong>Altura total:</strong> 24px (h-6)</li>
                      <li>• <strong>4 camadas sobrepostas:</strong> 2 vermelhas + 2 amarelas</li>
                      <li>• <strong>Larguras:</strong> Vermelho 100% / Amarelo 75%</li>
                      <li>• <strong>Espessuras:</strong> 1px sólido + 2-3px blur</li>
                    </ul>
                  </div>
                </div>
                {showCode && (
                  <code className="text-xs text-gray-400 block mt-4 p-3 bg-gray-900/60 rounded">
{`// Sublinhado elegante - 4 camadas (usado após headers)
<div className="w-full h-6 relative mt-2">
  {/* Camada 1: Vermelho com blur */}
  <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FF2400]/80 to-transparent h-[2px] w-full blur-sm" />
  
  {/* Camada 2: Vermelho sólido */}
  <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FF2400] to-transparent h-px w-full" />
  
  {/* Camada 3: Amarelo com blur (75% largura) */}
  <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FFDA04]/80 to-transparent h-[3px] w-3/4 blur-sm mx-auto" />
  
  {/* Camada 4: Amarelo sólido (75% largura) */}
  <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FFDA04] to-transparent h-px w-3/4 mx-auto" />
</div>`}
                  </code>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ButtonsSection({ showCode }: { showCode: boolean }) {
  return (
    <div className="space-y-6">
      <Card className={getGlassCardClasses('default')}>
        <CardHeader>
          <CardTitle className={getSFProTextClasses('h3', 'accent')}>
            🔘 Botões & Controles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Variantes de Botões */}
          <div>
            <h4 className={getSFProTextClasses('h4', 'accent')}>Variantes de Botões</h4>
            <div className="flex flex-wrap gap-4 mt-4">
              <Button className="bg-primary-yellow text-black hover:bg-primary-yellow/90 cursor-default" onClick={(e) => e.preventDefault()}>
                Primary
              </Button>
              <Button variant="outline" className="border-primary-yellow text-primary-yellow cursor-default" onClick={(e) => e.preventDefault()}>
                Outline
              </Button>
              <Button variant="ghost" className="cursor-default" onClick={(e) => e.preventDefault()}>
                Ghost
              </Button>
              <Button variant="secondary" className="cursor-default" onClick={(e) => e.preventDefault()}>
                Secondary
              </Button>
            </div>
            {showCode && (
              <pre className="text-xs text-gray-400 mt-4 p-3 bg-gray-900/60 rounded">
{`<Button className="bg-primary-yellow text-black">Primary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>`}
              </pre>
            )}
          </div>

          {/* Tamanhos */}
          <div>
            <h4 className={getSFProTextClasses('h4', 'accent')}>Tamanhos</h4>
            <div className="flex items-center gap-4 mt-4">
              <Button size="sm" className="bg-primary-yellow text-black cursor-default" onClick={(e) => e.preventDefault()}>
                Small
              </Button>
              <Button size="default" className="bg-primary-yellow text-black cursor-default" onClick={(e) => e.preventDefault()}>
                Default
              </Button>
              <Button size="lg" className="bg-primary-yellow text-black cursor-default" onClick={(e) => e.preventDefault()}>
                Large
              </Button>
            </div>
          </div>

          {/* Badges */}
          <div>
            <h4 className={getSFProTextClasses('h4', 'accent')}>Badges</h4>
            <div className="flex flex-wrap gap-4 mt-4">
              <Badge variant="default">Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ComponentsSection({ showCode }: { showCode: boolean }) {
  return (
    <div className="space-y-6">
      <Card className={getGlassCardClasses('default')}>
        <CardHeader>
          <CardTitle className={getSFProTextClasses('h3', 'accent')}>
            📊 Componentes de Dados
          </CardTitle>
          <p className={getSFProTextClasses('body', 'secondary')}>
            Cards, KPIs, tabelas e gráficos do sistema
          </p>
        </CardHeader>
        <CardContent className="space-y-8">
          
          {/* StatCards - 6 Variantes */}
          <div>
            <h4 className={getSFProTextClasses('h4', 'accent')}>StatCards - 6 Variantes</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              <StatCard
                variant="success"
                title="Receita Total"
                value="R$ 15.234,50"
                description="↑ +12.5% vs ontem"
                icon={DollarSign}
                className="cursor-default"
                onClick={(e) => e.preventDefault()}
              />
              <StatCard
                variant="warning"
                title="Estoque Baixo"
                value="23"
                description="produtos críticos"
                icon={AlertTriangle}
                className="cursor-default"
                onClick={(e) => e.preventDefault()}
              />
              <StatCard
                variant="error"
                title="Pendências"
                value="5"
                description="requer atenção"
                icon={Package}
                className="cursor-default"
                onClick={(e) => e.preventDefault()}
              />
              <StatCard
                variant="purple"
                title="Clientes Ativos"
                value="147"
                description="últimos 30 dias"
                icon={Users}
                className="cursor-default"
                onClick={(e) => e.preventDefault()}
              />
              <StatCard
                variant="premium"
                title="Vendas Hoje"
                value="28"
                description="↑ +8.3% média"
                icon={ShoppingCart}
                className="cursor-default"
                onClick={(e) => e.preventDefault()}
              />
              <StatCard
                variant="default"
                title="Performance"
                value="94.2%"
                description="sistema operacional"
                icon={TrendingUp}
                className="cursor-default"
                onClick={(e) => e.preventDefault()}
              />
            </div>
            {showCode && (
              <code className="text-xs text-gray-400 block mt-4 p-3 bg-gray-900/60 rounded">
{`// StatCard - 6 variantes disponíveis
<StatCard
  variant="success"        // success, warning, error, purple, premium, default
  title="Receita Total"    
  value="R$ 15.234,50"
  description="↑ +12.5%"
  icon={DollarSign}
/>

// Variantes de cor:
success  - Verde (accent-green)
warning  - Amarelo (primary-yellow) 
error    - Vermelho (accent-red)
purple   - Roxo (accent-purple)
premium  - Premium Yellow com border especial
default  - Neutro (gray-100)`}
              </code>
            )}
          </div>

          {/* Layout CRM vs Padrão */}
          <div>
            <h4 className={getSFProTextClasses('h4', 'accent')}>Layouts: CRM vs Padrão</h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
              {/* Layout CRM */}
              <div>
                <h5 className="text-accent-blue font-sf-medium text-sm mb-3">Layout CRM (Horizontal)</h5>
                <StatCard
                  layout="crm"
                  variant="success"
                  title="Vendas CRM"
                  value="R$ 8.750,00"
                  description="↑ +15.2% crescimento"
                  icon={BarChart3}
                  className="cursor-default"
                  onClick={(e) => e.preventDefault()}
                />
              </div>
              
              {/* Layout Padrão */}
              <div>
                <h5 className="text-accent-green font-sf-medium text-sm mb-3">Layout Padrão (Vertical)</h5>
                <StatCard
                  layout="default"
                  variant="success"
                  title="Vendas Padrão"
                  value="R$ 8.750,00"
                  description="↑ +15.2% crescimento"
                  icon={BarChart3}
                  className="cursor-default"
                  onClick={(e) => e.preventDefault()}
                />
              </div>
            </div>
            {showCode && (
              <code className="text-xs text-gray-400 block mt-4 p-3 bg-gray-900/60 rounded">
{`// Layout CRM (horizontal - usado em dashboards)
<StatCard layout="crm" variant="success" ... />

// Layout Padrão (vertical - usado em cards tradicionais)  
<StatCard layout="default" variant="success" ... />`}
              </code>
            )}
          </div>

          {/* Mini DataTable Preview */}
          <div>
            <h4 className={getSFProTextClasses('h4', 'accent')}>DataTable com Glass Morphism</h4>
            <div className={cn(getGlassCardClasses('default'), 'mt-4 overflow-hidden')}>
              <div className="p-0">
                <table className="w-full">
                  <thead className="border-b border-white/10 bg-black/20">
                    <tr className="text-left">
                      <th className="p-3 text-gray-300 font-semibold text-sm">Produto</th>
                      <th className="p-3 text-gray-300 font-semibold text-sm">Categoria</th>
                      <th className="p-3 text-gray-300 font-semibold text-sm">Estoque</th>
                      <th className="p-3 text-gray-300 font-semibold text-sm">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-white/5 hover:bg-white/5">
                      <td className="p-3 text-gray-100">Vinho Tinto Reserva</td>
                      <td className="p-3 text-gray-300">Tintos</td>
                      <td className="p-3 text-gray-100">47 un</td>
                      <td className="p-3">
                        <span className="px-2 py-1 text-xs bg-accent-green/20 text-accent-green rounded">
                          Normal
                        </span>
                      </td>
                    </tr>
                    <tr className="border-b border-white/5 hover:bg-white/5">
                      <td className="p-3 text-gray-100">Champagne Premium</td>
                      <td className="p-3 text-gray-300">Espumantes</td>
                      <td className="p-3 text-gray-100">8 un</td>
                      <td className="p-3">
                        <span className="px-2 py-1 text-xs bg-primary-yellow/20 text-primary-yellow rounded">
                          Baixo
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-white/5">
                      <td className="p-3 text-gray-100">Whiskey 12 Anos</td>
                      <td className="p-3 text-gray-300">Destilados</td>
                      <td className="p-3 text-gray-100">0 un</td>
                      <td className="p-3">
                        <span className="px-2 py-1 text-xs bg-accent-red/20 text-accent-red rounded">
                          Esgotado
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            {showCode && (
              <code className="text-xs text-gray-400 block mt-4 p-3 bg-gray-900/60 rounded">
{`// DataTable com Glass Morphism
<DataTable
  variant="premium"
  glassEffect={true}
  virtualization={true}
  data={products}
  columns={tableColumns}
/>

// Glass Card para tabelas customizadas
<div className={getGlassCardClasses('default')}>
  <table className="w-full">
    <thead className="bg-black/20 border-b border-white/10">
      // Headers
    </thead>
    <tbody>
      // Rows com hover:bg-white/5
    </tbody>
  </table>
</div>`}
              </code>
            )}
          </div>

        </CardContent>
      </Card>
    </div>
  );
}

function LayoutsSection({ showCode }: { showCode: boolean }) {
  return (
    <div className="space-y-6">
      <Card className={getGlassCardClasses('default')}>
        <CardHeader>
          <CardTitle className={getSFProTextClasses('h3', 'accent')}>
            📱 Layouts & Containers
          </CardTitle>
          <p className={getSFProTextClasses('body', 'secondary')}>
            Glass morphism, containers e padrões de layout do sistema
          </p>
        </CardHeader>
        <CardContent className="space-y-8">
          
          {/* Glass Card Variants - 5 Tipos */}
          <div>
            <h4 className={getSFProTextClasses('h4', 'accent')}>Glass Cards - 5 Variantes</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              
              {/* Default */}
              <Card className={getGlassCardClasses('default')}>
                <CardHeader>
                  <CardTitle className="text-gray-100 text-sm">Default</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 text-xs">bg-black/60 backdrop-blur-sm border-white/10</p>
                </CardContent>
              </Card>

              {/* Premium */}
              <Card className={getGlassCardClasses('premium')}>
                <CardHeader>
                  <CardTitle className="text-primary-yellow text-sm">Premium</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 text-xs">bg-black/40 border-yellow-400/30 shadow-lg</p>
                </CardContent>
              </Card>

              {/* Subtle */}
              <Card className={getGlassCardClasses('subtle')}>
                <CardHeader>
                  <CardTitle className="text-gray-100 text-sm">Subtle</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 text-xs">bg-black/20 border-gray-700/50</p>
                </CardContent>
              </Card>

              {/* Strong */}
              <Card className={getGlassCardClasses('strong')}>
                <CardHeader>
                  <CardTitle className="text-gray-100 text-sm">Strong</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 text-xs">bg-black/80 border-gray-600</p>
                </CardContent>
              </Card>

              {/* Yellow */}
              <Card className={getGlassCardClasses('yellow')}>
                <CardHeader>
                  <CardTitle className="text-primary-yellow text-sm">Yellow</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 text-xs">bg-yellow-400/10 border-yellow-400/30</p>
                </CardContent>
              </Card>
              
            </div>
            {showCode && (
              <code className="text-xs text-gray-400 block mt-4 p-3 bg-gray-900/60 rounded">
{`// Glass Card Variants - getGlassCardClasses()
<Card className={getGlassCardClasses('default')}>   // bg-black/60 backdrop-blur-sm border-white/10
<Card className={getGlassCardClasses('premium')}>   // bg-black/40 border-yellow-400/30 shadow-lg  
<Card className={getGlassCardClasses('subtle')}>    // bg-black/20 border-gray-700/50
<Card className={getGlassCardClasses('strong')}>    // bg-black/80 border-gray-600
<Card className={getGlassCardClasses('yellow')}>    // bg-yellow-400/10 border-yellow-400/30

// Usado em todo o sistema para consistência visual`}
              </code>
            )}
          </div>

          {/* Container Hierarchy */}
          <div>
            <h4 className={getSFProTextClasses('h4', 'accent')}>Hierarquia de Containers</h4>
            <div className="mt-4 space-y-4">
              
              {/* PageContainer Example */}
              <div className={cn(getGlassCardClasses('subtle'), 'p-4')}>
                <h5 className="text-accent-purple font-sf-medium text-sm mb-3">PageContainer (Nível 1)</h5>
                <div className="bg-accent-purple/10 border border-accent-purple/30 rounded p-3">
                  <p className="text-accent-purple text-xs mb-2">max-width + margin auto + padding</p>
                  
                  {/* Card Level */}
                  <div className={cn(getGlassCardClasses('default'), 'p-3')}>
                    <h6 className="text-accent-blue font-sf-medium text-xs mb-2">Card (Nível 2)</h6>
                    <div className="bg-accent-blue/10 border border-accent-blue/30 rounded p-2">
                      <p className="text-accent-blue text-xs mb-2">Glass morphism + backdrop-blur</p>
                      
                      {/* Content Level */}
                      <div className="bg-accent-green/10 border border-accent-green/30 rounded p-2">
                        <p className="text-accent-green text-xs">CardContent (Nível 3)</p>
                        <p className="text-gray-400 text-xs">Conteúdo final</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {showCode && (
              <code className="text-xs text-gray-400 block mt-4 p-3 bg-gray-900/60 rounded">
{`// Hierarchy Pattern usado no sistema
<PageContainer>                           // Nível 1: Layout principal
  <Card className={getGlassCardClasses('default')}>  // Nível 2: Glass container  
    <CardHeader>                          // Header com título
      <CardTitle>Título da Seção</CardTitle>
    </CardHeader>
    <CardContent>                         // Nível 3: Conteúdo
      {/* Seu conteúdo aqui */}
    </CardContent>
  </Card>
</PageContainer>`}
              </code>
            )}
          </div>

          {/* Grid Systems */}
          <div>
            <h4 className={getSFProTextClasses('h4', 'accent')}>Sistemas de Grid Responsivos</h4>
            <div className="space-y-4 mt-4">
              
              {/* Grid 4 colunas - KPIs */}
              <div>
                <h5 className="text-accent-yellow font-sf-medium text-sm mb-3">Grid KPIs (4 colunas)</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className={cn(getGlassCardClasses('default'), 'p-3 text-center')}>
                      <p className="text-gray-100 text-xs">KPI {i}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grid 3 colunas - Cards */}
              <div>
                <h5 className="text-accent-blue font-sf-medium text-sm mb-3">Grid Cards (3 colunas)</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1,2,3].map(i => (
                    <div key={i} className={cn(getGlassCardClasses('default'), 'p-4')}>
                      <p className="text-gray-100 text-sm">Card {i}</p>
                      <p className="text-gray-400 text-xs mt-1">Conteúdo do card</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grid 2 colunas - Dashboard */}
              <div>
                <h5 className="text-accent-green font-sf-medium text-sm mb-3">Grid Dashboard (2 colunas)</h5>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className={cn(getGlassCardClasses('default'), 'p-4 h-32')}>
                    <p className="text-gray-100 text-sm">Gráfico / Chart</p>
                    <p className="text-gray-400 text-xs">Área principal</p>
                  </div>
                  <div className={cn(getGlassCardClasses('default'), 'p-4 h-32')}>
                    <p className="text-gray-100 text-sm">Alertas / KPIs</p>
                    <p className="text-gray-400 text-xs">Área secundária</p>
                  </div>
                </div>
              </div>
            </div>
            {showCode && (
              <code className="text-xs text-gray-400 block mt-4 p-3 bg-gray-900/60 rounded">
{`// Grid Systems Responsivos

// Grid KPIs (4 colunas) - usado em dashboards
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {kpiData.map(kpi => <StatCard key={kpi.id} {...kpi} />)}
</div>

// Grid Cards (3 colunas) - usado para listas de items  
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => <Card key={item.id} />)}
</div>

// Grid Dashboard (2 colunas) - usado para charts + sidebar
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <ChartSection />
  <AlertsSection />
</div>`}
              </code>
            )}
          </div>

        </CardContent>
      </Card>
    </div>
  );
}

function AnimationsSection({ showCode }: { showCode: boolean }) {
  return (
    <div className="space-y-6">
      <Card className={getGlassCardClasses('default')}>
        <CardHeader>
          <CardTitle className={getSFProTextClasses('h3', 'accent')}>
            ✨ Efeitos & Animações
          </CardTitle>
          <p className={getSFProTextClasses('body', 'secondary')}>
            Aceternity UI, Framer Motion e efeitos visuais do sistema
          </p>
        </CardHeader>
        <CardContent className="space-y-8">
          
          {/* BlurIn Examples */}
          <div>
            <h4 className={getSFProTextClasses('h4', 'accent')}>BlurIn - Animação de Entrada</h4>
            <div className="space-y-4 mt-4">
              
              {/* BlurIn Rápido */}
              <div className={cn(getGlassCardClasses('subtle'), 'p-4 text-center')}>
                <h5 className="text-accent-blue font-sf-medium text-sm mb-3">Rápido (0.8s)</h5>
                <BlurIn
                  word="ANIMAÇÃO RÁPIDA"
                  duration={0.8}
                  className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FF2400] via-[#FFDA04] to-[#FF2400]"
                />
              </div>

              {/* BlurIn Padrão */}
              <div className={cn(getGlassCardClasses('subtle'), 'p-4 text-center')}>
                <h5 className="text-accent-green font-sf-medium text-sm mb-3">Padrão (1.2s) - Usado nos Headers</h5>
                <BlurIn
                  word="DESIGN SYSTEM"
                  duration={1.2}
                  className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FF2400] via-[#FFDA04] to-[#FF2400]"
                />
              </div>

              {/* BlurIn Lento */}
              <div className={cn(getGlassCardClasses('subtle'), 'p-4 text-center')}>
                <h5 className="text-accent-purple font-sf-medium text-sm mb-3">Lento (1.8s)</h5>
                <BlurIn
                  word="EFEITO DRAMÁTICO"
                  duration={1.8}
                  className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-purple to-accent-blue"
                />
              </div>
            </div>
            {showCode && (
              <code className="text-xs text-gray-400 block mt-4 p-3 bg-gray-900/60 rounded">
{`// BlurIn Animation (Aceternity UI)
<BlurIn
  word="SEU TEXTO AQUI"
  duration={1.2}                    // 0.8s rápido, 1.2s padrão, 1.8s+ lento
  variant={{
    hidden: { filter: "blur(15px)", opacity: 0 },
    visible: { filter: "blur(0px)", opacity: 1 }
  }}
  className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF2400] via-[#FFDA04] to-[#FF2400]"
  style={{
    textShadow: '0 2px 4px rgba(0,0,0,0.3), 0 0 20px rgba(255, 218, 4, 0.2)'
  }}
/>`}
              </code>
            )}
          </div>

          {/* Aceternity UI Components */}
          <div>
            <h4 className={getSFProTextClasses('h4', 'accent')}>Aceternity UI - Componentes Avançados</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              
              {/* SparklesText */}
              <div className={cn(getGlassCardClasses('default'), 'p-6 text-center')}>
                <h5 className="text-accent-yellow font-sf-medium text-sm mb-4">SparklesText</h5>
                <SparklesText 
                  text="✨ MÁGICO ✨" 
                  className="text-xl font-bold text-primary-yellow"
                />
                <p className="text-gray-400 text-xs mt-3">Partículas animadas ao redor do texto</p>
              </div>

              {/* GradualSpacing */}
              <div className={cn(getGlassCardClasses('default'), 'p-6 text-center')}>
                <h5 className="text-accent-blue font-sf-medium text-sm mb-4">GradualSpacing</h5>
                <GradualSpacing
                  className="font-display text-center text-lg font-bold tracking-[-0.1em] text-accent-blue"
                  text="ESPAÇAMENTO"
                />
                <p className="text-gray-400 text-xs mt-3">Letras se expandem gradualmente</p>
              </div>
            </div>
            {showCode && (
              <code className="text-xs text-gray-400 block mt-4 p-3 bg-gray-900/60 rounded">
{`// SparklesText - Partículas animadas
<SparklesText 
  text="✨ MÁGICO ✨"
  className="text-xl font-bold text-primary-yellow"
/>

// GradualSpacing - Expansão de letras  
<GradualSpacing
  className="font-bold text-lg text-accent-blue"
  text="ESPAÇAMENTO"
/>`}
              </code>
            )}
          </div>

          {/* Hover Effects */}
          <div>
            <h4 className={getSFProTextClasses('h4', 'accent')}>Hover Effects & Transforms</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              
              {/* Scale Transform */}
              <div className={cn(
                getGlassCardClasses('default'), 
                'p-4 text-center cursor-default hover:transform hover:scale-105 transition-all duration-200'
              )}>
                <TrendingUp className="w-8 h-8 text-accent-green mx-auto mb-2" />
                <p className="text-accent-green text-sm font-medium">Scale Hover</p>
                <p className="text-gray-400 text-xs">hover:scale-105</p>
              </div>

              {/* Translate Y */}
              <div className={cn(
                getGlassCardClasses('default'), 
                'p-4 text-center cursor-default hover:transform hover:-translate-y-1 transition-all duration-200'
              )}>
                <ShoppingCart className="w-8 h-8 text-accent-blue mx-auto mb-2" />
                <p className="text-accent-blue text-sm font-medium">Translate Y</p>
                <p className="text-gray-400 text-xs">hover:-translate-y-1</p>
              </div>

              {/* Glow Effect */}
              <div className={cn(
                getGlassCardClasses('default'), 
                'p-4 text-center cursor-default hover:shadow-lg hover:shadow-primary-yellow/25 transition-all duration-200'
              )}>
                <DollarSign className="w-8 h-8 text-primary-yellow mx-auto mb-2" />
                <p className="text-primary-yellow text-sm font-medium">Glow Effect</p>
                <p className="text-gray-400 text-xs">shadow-primary-yellow/25</p>
              </div>
            </div>
            {showCode && (
              <code className="text-xs text-gray-400 block mt-4 p-3 bg-gray-900/60 rounded">
{`// Hover Effects no sistema

// Scale (usado em StatCards)
className="hover:transform hover:scale-105 transition-all duration-200"

// Translate Y (usado em cards)
className="hover:transform hover:-translate-y-1 transition-all duration-200"

// Glow (usado em botões premium)
className="hover:shadow-lg hover:shadow-primary-yellow/25 transition-all duration-200"

// Combinado (StatCard padrão)
className="hover:transform hover:-translate-y-1 transition-all duration-200"`}
              </code>
            )}
          </div>

          {/* Loading States */}
          <div>
            <h4 className={getSFProTextClasses('h4', 'accent')}>Loading States & Pulses</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              
              {/* Pulse */}
              <div className={cn(getGlassCardClasses('default'), 'p-4 text-center animate-pulse')}>
                <div className="w-12 h-12 bg-gray-600 rounded mx-auto mb-2"></div>
                <p className="text-gray-400 text-sm">Pulse Loading</p>
                <p className="text-gray-500 text-xs">animate-pulse</p>
              </div>

              {/* Spin */}
              <div className={cn(getGlassCardClasses('default'), 'p-4 text-center')}>
                <div className="w-8 h-8 border-2 border-primary-yellow border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-primary-yellow text-sm">Spin Loading</p>
                <p className="text-gray-400 text-xs">animate-spin</p>
              </div>

              {/* Bounce */}
              <div className={cn(getGlassCardClasses('default'), 'p-4 text-center')}>
                <div className="w-3 h-3 bg-accent-green rounded-full animate-bounce mx-auto mb-2"></div>
                <p className="text-accent-green text-sm">Bounce Alert</p>
                <p className="text-gray-400 text-xs">animate-bounce</p>
              </div>
            </div>
            {showCode && (
              <code className="text-xs text-gray-400 block mt-4 p-3 bg-gray-900/60 rounded">
{`// Loading Animations

// Pulse (skeleton loading)
<div className="animate-pulse">
  <div className="w-12 h-12 bg-gray-600 rounded"></div>
</div>

// Spinner
<div className="w-8 h-8 border-2 border-primary-yellow border-t-transparent rounded-full animate-spin"></div>

// Bounce (alertas críticos)
<div className="w-3 h-3 bg-accent-green rounded-full animate-bounce"></div>

// Usado em: StatCards (isLoading), DataTable, modais`}
              </code>
            )}
          </div>

        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

function ColorGroup({ title, colors }: { title: string; colors: Array<{name: string; value: string; var: string}> }) {
  return (
    <div>
      <h5 className={cn(getSFProTextClasses('label', 'accent'), 'mb-3')}>
        {title}
      </h5>
      <div className="space-y-2">
        {colors.map((color) => (
          <div key={color.name} className="flex items-center gap-3 p-2 rounded-lg">
            <div 
              className={cn(color.var, 'w-8 h-8 rounded border border-white/10')} 
            />
            <div>
              <p className={getSFProTextClasses('small')}>{color.name}</p>
              <p className={getSFProTextClasses('small', 'secondary')}>{color.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TypographyExample({ text, className, code, showCode }: { 
  text: string; 
  className: string; 
  code: string; 
  showCode: boolean; 
}) {
  return (
    <div className="p-4 border border-gray-700/50 rounded-lg">
      <div className={className}>{text}</div>
      {showCode && (
        <code className="text-xs text-gray-400 block mt-2">{code}</code>
      )}
    </div>
  );
}

// ============================================================================
// NOVAS SEÇÕES DO DESIGN SYSTEM 
// ============================================================================

// Dados de exemplo para os gráficos
const sampleChartData = [
  { period: '2024-01-01', period_label: '01/01', revenue: 1250.50, orders: 8 },
  { period: '2024-01-02', period_label: '02/01', revenue: 980.25, orders: 6 },
  { period: '2024-01-03', period_label: '03/01', revenue: 1580.75, orders: 12 },
  { period: '2024-01-04', period_label: '04/01', revenue: 2100.00, orders: 15 },
  { period: '2024-01-05', period_label: '05/01', revenue: 1750.25, orders: 11 },
  { period: '2024-01-06', period_label: '06/01', revenue: 2350.80, orders: 18 },
  { period: '2024-01-07', period_label: '07/01', revenue: 1950.60, orders: 13 }
];

// Seção Charts - Visualização de Dados
function ChartsSection({ showCode }: { showCode: boolean }) {
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/95 backdrop-blur-xl border border-white/30 rounded-xl p-4 shadow-2xl">
          <p className="text-sm mb-2 text-gray-300 font-medium">{formatDate(label)}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-white font-semibold">
                {entry.dataKey === 'revenue' ? 'Receita: ' : 'Vendas: '}
                {entry.dataKey === 'revenue' 
                  ? formatCurrency(entry.value) 
                  : `${entry.value} vendas`
                }
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      <Card className="border-white/20 bg-black/80 backdrop-blur-xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-amber-400" />
            📊 Visualização de Dados
          </CardTitle>
          <p className={getSFProTextClasses('body', 'secondary')}>
            Componentes Recharts com tema customizado - LineChart, BarChart, Tooltips
          </p>
        </CardHeader>
        <CardContent className="space-y-8">

          {/* Gráficos Recharts */}
          <div>
            <h4 className={getSFProTextClasses('h4', 'accent')}>Charts Dashboard Style</h4>
            
            {/* Chart Controls */}
            <div className="flex items-center gap-2 mb-4">
              {/* Period selector */}
              <div className="flex bg-white/5 rounded-lg p-1">
                {['7d', '30d', '90d'].map((period) => (
                  <Button
                    key={period}
                    variant={selectedPeriod === period ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setSelectedPeriod(period)}
                    className={cn(
                      "text-xs h-7",
                      selectedPeriod === period 
                        ? "bg-amber-500 text-white hover:bg-amber-600 font-semibold" 
                        : "hover:text-white hover:bg-white/15 font-medium text-gray-300"
                    )}
                  >
                    {period}
                  </Button>
                ))}
              </div>

              {/* Chart type selector */}
              <div className="flex bg-white/5 rounded-lg p-1">
                <Button
                  variant={chartType === 'line' ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setChartType('line')}
                  className={cn(
                    "text-xs h-7",
                    chartType === 'line'
                      ? "bg-amber-500 text-white hover:bg-amber-600 font-semibold" 
                      : "hover:text-white hover:bg-white/15 font-medium text-gray-300"
                  )}
                >
                  <TrendingUp className="h-3 w-3" />
                </Button>
                <Button
                  variant={chartType === 'bar' ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setChartType('bar')}
                  className={cn(
                    "text-xs h-7",
                    chartType === 'bar'
                      ? "bg-amber-500 text-white hover:bg-amber-600 font-semibold" 
                      : "hover:text-white hover:bg-white/15 font-medium text-gray-300"
                  )}
                >
                  <BarChart3 className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Chart Container */}
            <div className={cn(getGlassCardClasses('default'), 'p-4')}>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === 'line' ? (
                    <RechartsLineChart data={sampleChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.15)" />
                      <XAxis 
                        dataKey="period"
                        tickFormatter={formatDate}
                        stroke="#d1d5db"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="#d1d5db"
                        fontSize={12}
                        tickFormatter={(value) => formatCurrency(value).replace('R$', 'R$')}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#fbbf24" 
                        strokeWidth={3}
                        dot={{ fill: '#fbbf24', strokeWidth: 0, r: 4 }}
                        activeDot={{ r: 6, stroke: '#fbbf24', strokeWidth: 2, fill: '#fff' }}
                      />
                    </RechartsLineChart>
                  ) : (
                    <RechartsBarChart data={sampleChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.15)" />
                      <XAxis 
                        dataKey="period"
                        tickFormatter={formatDate}
                        stroke="#d1d5db"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="#d1d5db"
                        fontSize={12}
                        tickFormatter={(value) => formatCurrency(value).replace('R$', 'R$')}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar 
                        dataKey="revenue" 
                        fill="#fbbf24"
                        radius={[4, 4, 0, 0]}
                      />
                    </RechartsBarChart>
                  )}
                </ResponsiveContainer>
              </div>
              
              {/* Chart Summary */}
              <div className="mt-4 pt-3 border-t border-white/10">
                <div className="flex items-center justify-between text-xs text-gray-300">
                  <span className="font-medium">
                    7 dias • Total: {formatCurrency(
                      sampleChartData.reduce((sum, item) => sum + item.revenue, 0)
                    )}
                  </span>
                  <span className="font-medium">
                    {sampleChartData.reduce((sum, item) => sum + item.orders, 0)} vendas
                  </span>
                </div>
              </div>
            </div>

            {showCode && (
              <code className="text-xs text-gray-400 block mt-4 p-3 bg-gray-900/60 rounded">
{`// Recharts Configuration

// CustomTooltip Component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/95 backdrop-blur-xl border border-white/30 rounded-xl p-4 shadow-2xl">
        <p className="text-sm mb-2 text-gray-300 font-medium">{formatDate(label)}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-sm text-white font-semibold">
              {entry.dataKey === 'revenue' ? 'Receita: ' : 'Vendas: '}
              {entry.dataKey === 'revenue' ? formatCurrency(entry.value) : \`\${entry.value} vendas\`}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// LineChart Configuration
<RechartsLineChart data={data}>
  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.15)" />
  <XAxis dataKey="period" tickFormatter={formatDate} stroke="#d1d5db" fontSize={12} />
  <YAxis stroke="#d1d5db" fontSize={12} tickFormatter={(value) => formatCurrency(value)} />
  <Tooltip content={<CustomTooltip />} />
  <Line type="monotone" dataKey="revenue" stroke="#fbbf24" strokeWidth={3}
        dot={{ fill: '#fbbf24', strokeWidth: 0, r: 4 }}
        activeDot={{ r: 6, stroke: '#fbbf24', strokeWidth: 2, fill: '#fff' }} />
</RechartsLineChart>`}
              </code>
            )}
          </div>

          {/* Chart Loading States */}
          <div>
            <h4 className={getSFProTextClasses('h4', 'accent')}>Chart Loading States</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              
              {/* Loading Spinner */}
              <div className={cn(getGlassCardClasses('default'), 'p-4')}>
                <div style={{ height: 200 }} className="flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-amber-300/30 border-t-amber-300 rounded-full animate-spin" />
                </div>
                <div className="mt-4 pt-3 border-t border-white/10 text-center">
                  <p className="text-amber-300 text-sm font-medium">Carregando dados...</p>
                </div>
              </div>

              {/* Error State */}
              <div className={cn(getGlassCardClasses('default'), 'p-4 border-red-500/40')}>
                <div style={{ height: 200 }} className="flex items-center justify-center">
                  <div className="text-center">
                    <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-2" />
                    <p className="text-red-300 text-sm font-medium">Erro ao carregar</p>
                    <p className="text-gray-400 text-xs">Verifique sua conexão</p>
                  </div>
                </div>
              </div>
            </div>

            {showCode && (
              <code className="text-xs text-gray-400 block mt-4 p-3 bg-gray-900/60 rounded">
{`// Chart Loading States

// Loading Spinner
{isLoading ? (
  <div style={{ height: computedHeight }} className="flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-amber-300/30 border-t-amber-300 rounded-full animate-spin" />
  </div>
) : (
  <ResponsiveContainer width="100%" height="100%">
    {/* Chart content */}
  </ResponsiveContainer>
)}

// Error State
{error ? (
  <Card className="border-red-500/40 bg-black/80 backdrop-blur-xl shadow-lg">
    <CardContent className="text-center py-8">
      <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-2" />
      <p className="text-red-300">Erro ao carregar dados</p>
    </CardContent>
  </Card>
) : null}`}
              </code>
            )}
          </div>

        </CardContent>
      </Card>
    </div>
  );
}

// Seção Interactive - Componentes Interativos  
function InteractiveSection({ showCode }: { showCode: boolean }) {
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
  const [alertSeverity, setAlertSeverity] = useState<'critical' | 'warning' | 'info'>('warning');

  const sampleAlerts = [
    { id: '1', title: 'Estoque Baixo', description: '3 produtos com estoque crítico', severity: 'critical' as const, count: 3, icon: '📦' },
    { id: '2', title: 'Vendas em Crescimento', description: 'Receita 15% acima da meta mensal', severity: 'info' as const, icon: '📈' },
    { id: '3', title: 'Prazo de Entrega', description: '2 entregas com atraso previsto', severity: 'warning' as const, count: 2, icon: '🚚' }
  ];

  const severityConfig = {
    critical: { color: 'text-red-400', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/30', icon: XCircle },
    warning: { color: 'text-amber-400', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/30', icon: AlertTriangle },
    info: { color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30', icon: Info }
  };

  return (
    <div className="space-y-8">
      <Card className="border-white/20 bg-black/80 backdrop-blur-xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <MousePointer className="h-6 w-6 text-cyan-400" />
            🎛️ Componentes Interativos
          </CardTitle>
          <p className={getSFProTextClasses('body', 'secondary')}>
            Carousels, selectors, alerts, controles avançados do dashboard
          </p>
        </CardHeader>
        <CardContent className="space-y-8">

          {/* Alerts Carousel */}
          <div>
            <h4 className={getSFProTextClasses('h4', 'accent')}>Alerts Carousel</h4>
            
            <div className={cn(
              'border-white/20 bg-black/80 backdrop-blur-xl shadow-lg rounded-xl overflow-hidden mt-4',
              'hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-400/30 transition-all duration-300 relative group'
            )}>
              <div className="flex items-center justify-between p-4 pb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-400" />
                  <span className="text-lg font-bold text-amber-400">Alertas</span>
                  <span className="text-sm bg-white/10 px-2 py-1 rounded-full font-medium">3</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-400 hover:text-amber-300">
                    <Pause className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setCurrentCarouselIndex((prev) => (prev - 1 + sampleAlerts.length) % sampleAlerts.length)} className="h-7 w-7 p-0 text-gray-400 hover:text-amber-300">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setCurrentCarouselIndex((prev) => (prev + 1) % sampleAlerts.length)} className="h-7 w-7 p-0 text-gray-400 hover:text-amber-300">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="px-4 pb-4">
                <div className="relative overflow-hidden">
                  <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentCarouselIndex * 100}%)` }}>
                    {sampleAlerts.map((alert, index) => {
                      const alertConfig = severityConfig[alert.severity];
                      const AlertIcon = alertConfig.icon;
                      
                      return (
                        <div key={alert.id} className="w-full flex-shrink-0">
                          <div className={cn("rounded-xl border p-4 transition-all duration-300", alertConfig.bgColor, alertConfig.borderColor, index === currentCarouselIndex ? "ring-2 ring-white/20" : "")}>
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3 flex-1">
                                <AlertIcon className={cn("h-6 w-6 mt-0.5", alertConfig.color)} />
                                <div className="flex-1">
                                  <div className="text-base font-semibold text-white flex items-center gap-2">
                                    {alert.title}
                                    <span className="text-lg">{alert.icon}</span>
                                  </div>
                                  <div className="text-sm mt-2 text-gray-300">{alert.description}</div>
                                  {alert.count && (
                                    <div className="text-sm mt-2 font-medium text-gray-400">
                                      {alert.count} item{alert.count > 1 ? 's' : ''}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <ExternalLink className="h-5 w-5 text-gray-400" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 pt-3">
                  {sampleAlerts.map((_, index) => {
                    const alert = sampleAlerts[index];
                    const dotConfig = severityConfig[alert.severity];
                    return (
                      <button key={index} onClick={() => setCurrentCarouselIndex(index)}
                        className={cn("w-2 h-2 rounded-full transition-all duration-300",
                          index === currentCarouselIndex ? cn("w-6", dotConfig.color.replace('text-', 'bg-')) : "bg-gray-600 hover:bg-gray-500")} />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Select Components */}
          <div>
            <h4 className={getSFProTextClasses('h4', 'accent')}>Select Components</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              
              <div>
                <p className="text-sm text-gray-300 mb-2">Custom Select (Dashboard Style)</p>
                <Select value={alertSeverity} onValueChange={(value: any) => setAlertSeverity(value)}>
                  <SelectTrigger className="bg-black/40 border-white/30 text-white hover:bg-black/60 hover:border-purple-400/50 transition-all duration-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900/95 border-white/20 backdrop-blur-xl">
                    <SelectItem value="critical" className="text-white hover:bg-white/10">Crítico</SelectItem>
                    <SelectItem value="warning" className="text-white hover:bg-white/10">Aviso</SelectItem>
                    <SelectItem value="info" className="text-white hover:bg-white/10">Informação</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <p className="text-sm text-gray-300 mb-2">Multi-button Selector</p>
                <div className="flex bg-white/5 rounded-lg p-1">
                  {['7d', '30d', '90d'].map((period) => (
                    <Button key={period} variant={period === '30d' ? "default" : "ghost"} size="sm"
                      className={cn("text-xs h-7 flex-1", period === '30d' ? "bg-amber-500 text-white hover:bg-amber-600 font-semibold" : "hover:text-white hover:bg-white/15 font-medium text-gray-300")}>
                      {period}
                    </Button>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}

// Seção States - Estados de Interface
function StatesSection({ showCode }: { showCode: boolean }) {
  return (
    <div className="space-y-8">
      <Card className="border-white/20 bg-black/80 backdrop-blur-xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-green-400" />
            🎭 Estados de Interface
          </CardTitle>
          <p className={getSFProTextClasses('body', 'secondary')}>
            Loading states, hover effects, progress indicators, mouse tracking
          </p>
        </CardHeader>
        <CardContent className="space-y-8">

          {/* Mouse Tracking Effects */}
          <div>
            <h4 className={getSFProTextClasses('h4', 'accent')}>Mouse Tracking Effects</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              
              <div className={cn(
                'border-white/20 bg-black/80 backdrop-blur-xl shadow-lg rounded-xl p-6 relative overflow-hidden group cursor-pointer',
                'hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-400/30 transition-all duration-300'
              )}
              onMouseMove={(e) => {
                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                (e.currentTarget as HTMLElement).style.setProperty("--x", `${x}%`);
                (e.currentTarget as HTMLElement).style.setProperty("--y", `${y}%`);
              }}>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500/20 via-transparent to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" 
                     style={{ background: `radial-gradient(600px circle at var(--x, 50%) var(--y, 50%), rgba(147, 51, 234, 0.15), transparent 40%)` }} />
                <div className="relative z-10">
                  <h5 className="text-purple-300 font-semibold mb-2">Purple Glow Effect</h5>
                  <p className="text-gray-400 text-sm">Movimente o mouse para ver o efeito radial</p>
                </div>
              </div>

              <div className={cn(getGlassCardClasses('default'), 'p-6 cursor-pointer hover:transform hover:scale-105 transition-all duration-200')}>
                <TrendingUp className="w-8 h-8 text-accent-green mb-3" />
                <h5 className="text-accent-green font-semibold mb-2">Scale Transform</h5>
                <p className="text-gray-400 text-sm">hover:scale-105</p>
              </div>

            </div>
          </div>

          {/* Progress Indicators */}
          <div>
            <h4 className={getSFProTextClasses('h4', 'accent')}>Progress Indicators</h4>
            <div className="space-y-4 mt-4">
              
              <div className={cn(getGlassCardClasses('default'), 'p-4')}>
                <p className="text-gray-300 text-sm mb-3">Barra de Progresso Animada</p>
                <div className="w-full bg-gray-700 rounded-full h-1 overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full transition-all ease-linear animate-pulse" style={{ width: '68%' }} />
                </div>
                <p className="text-xs text-gray-500 mt-2">68% concluído</p>
              </div>

              <div className={cn(getGlassCardClasses('default'), 'p-4')}>
                <p className="text-gray-300 text-sm mb-3">Dots Progress (Carousel)</p>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-6 h-2 bg-amber-400 rounded-full" />
                  <div className="w-2 h-2 bg-gray-600 rounded-full" />
                  <div className="w-2 h-2 bg-gray-600 rounded-full" />
                  <div className="w-2 h-2 bg-red-400 rounded-full" />
                </div>
              </div>

            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}

// Seção POS - Point of Sale & E-commerce Components
function POSSection({ showCode }: { showCode: boolean }) {
  const [selectedSaleType, setSelectedSaleType] = useState('presencial');
  const [cartItems, setCartItems] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('dinheiro');
  const [searchTerm, setSearchTerm] = useState('');
  
  const saleTypes = [
    { 
      id: 'presencial', 
      label: 'Presencial', 
      description: 'Venda na loja',
      color: 'bg-blue-500/20 border-blue-400/30 text-blue-300'
    },
    { 
      id: 'delivery', 
      label: 'Delivery', 
      description: 'Entrega domicílio',
      color: 'bg-green-500/20 border-green-400/30 text-green-300'
    },
    { 
      id: 'pickup', 
      label: 'Pickup', 
      description: 'Retirada cliente',
      color: 'bg-purple-500/20 border-purple-400/30 text-purple-300'
    }
  ];

  const paymentMethods = [
    { id: 'dinheiro', label: 'Dinheiro', icon: '💵' },
    { id: 'cartao', label: 'Cartão', icon: '💳' },
    { id: 'pix', label: 'PIX', icon: '📱' },
    { id: 'fiado', label: 'Fiado', icon: '📋' }
  ];

  return (
    <div className="space-y-6">
      <Card className={getGlassCardClasses('default')}>
        <CardHeader>
          <CardTitle className={getSFProTextClasses('h3', 'accent')}>
            🛒 POS & E-commerce
          </CardTitle>
          <p className={getSFProTextClasses('body', 'secondary')}>
            Carrinho, pagamento, busca, layout de vendas
          </p>
        </CardHeader>
        <CardContent className="space-y-8">

          {/* Sale Type Selector */}
          <div>
            <h4 className={getSFProTextClasses('h4', 'accent')}>Sale Type Selector (Tri-State)</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {saleTypes.map((type) => (
                <div 
                  key={type.id}
                  onClick={() => setSelectedSaleType(type.id)}
                  className={cn(
                    'p-4 rounded-lg border cursor-pointer transition-all duration-200',
                    'backdrop-blur-sm hover:scale-105',
                    selectedSaleType === type.id 
                      ? type.color + ' ring-2 ring-white/20' 
                      : 'bg-black/40 border-white/20 text-gray-300 hover:border-white/40'
                  )}
                >
                  <h5 className="font-sf-medium text-sm mb-1">{type.label}</h5>
                  <p className="text-xs opacity-80">{type.description}</p>
                </div>
              ))}
            </div>
            {showCode && (
              <code className="text-xs text-gray-400 block mt-4 p-3 bg-gray-900/60 rounded">
{`// Sale Type Selector - Tri-state com cores específicas
const saleTypes = [
  { id: 'presencial', label: 'Presencial', color: 'bg-blue-500/20 border-blue-400/30 text-blue-300' },
  { id: 'delivery', label: 'Delivery', color: 'bg-green-500/20 border-green-400/30 text-green-300' },
  { id: 'pickup', label: 'Pickup', color: 'bg-purple-500/20 border-purple-400/30 text-purple-300' }
];

{saleTypes.map((type) => (
  <div key={type.id} onClick={() => setSelectedSaleType(type.id)}
       className={cn('p-4 rounded-lg border cursor-pointer',
         selectedSaleType === type.id ? type.color : 'bg-black/40 border-white/20')}>
    <h5>{type.label}</h5>
    <p>{type.description}</p>
  </div>
))}`}
              </code>
            )}
          </div>

          {/* Hero Spotlight Effect */}
          <div>
            <h4 className={getSFProTextClasses('h4', 'accent')}>Hero Spotlight Effect</h4>
            <div 
              className="flex items-center space-x-2 p-6 rounded-lg bg-black/70 backdrop-blur-xl border border-white/20 shadow-lg hero-spotlight mt-4"
              onMouseMove={(e) => {
                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                (e.currentTarget as HTMLElement).style.setProperty("--x", `${x}%`);
                (e.currentTarget as HTMLElement).style.setProperty("--y", `${y}%`);
              }}
            >
              <div className="absolute inset-0 rounded-lg bg-gradient-radial opacity-0 transition-opacity duration-500" 
                   style={{ background: `radial-gradient(600px circle at var(--x, 50%) var(--y, 50%), rgba(255, 218, 4, 0.1), transparent 40%)` }} />
              <div className="relative z-10 flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-400/20 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h5 className="text-white font-sf-medium">Customer Search Component</h5>
                  <p className="text-gray-300 text-sm">Movimente o mouse para ver o spotlight effect</p>
                </div>
              </div>
            </div>
            {showCode && (
              <code className="text-xs text-gray-400 block mt-4 p-3 bg-gray-900/60 rounded">
{`// Hero Spotlight Effect - Mouse tracking
<div 
  className="bg-black/70 backdrop-blur-xl border border-white/20 hero-spotlight"
  onMouseMove={(e) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    (e.currentTarget as HTMLElement).style.setProperty("--x", \`\${x}%\`);
    (e.currentTarget as HTMLElement).style.setProperty("--y", \`\${y}%\`);
  }}
>
  <div className="absolute inset-0 bg-gradient-radial opacity-0 hover:opacity-100" 
       style={{ background: \`radial-gradient(600px circle at var(--x, 50%) var(--y, 50%), rgba(255, 218, 4, 0.1), transparent 40%)\` }} />
  {/* Content */}
</div>`}
              </code>
            )}
          </div>

          {/* Shopping Cart Components */}
          <div>
            <h4 className={getSFProTextClasses('h4', 'accent')}>Shopping Cart Components</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              
              {/* Cart Badge */}
              <div className={cn(getGlassCardClasses('default'), 'p-4')}>
                <h5 className="text-accent-blue font-sf-medium text-sm mb-3">Cart Badge</h5>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <ShoppingCart className="w-8 h-8 text-gray-300" />
                    <Badge className="absolute -top-2 -right-2 bg-red-500 text-white px-2 py-1 text-xs rounded-full">
                      {cartItems || 0}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => setCartItems(prev => prev + 1)} className="bg-accent-green text-white">+</Button>
                    <Button size="sm" onClick={() => setCartItems(prev => Math.max(0, prev - 1))} className="bg-accent-red text-white">-</Button>
                  </div>
                </div>
              </div>

              {/* Empty Cart State */}
              <div className={cn(getGlassCardClasses('default'), 'p-4')}>
                <h5 className="text-accent-yellow font-sf-medium text-sm mb-3">Empty Cart State</h5>
                <div className="text-center py-4">
                  <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-300 text-sm mb-1">Carrinho vazio</p>
                  <p className="text-gray-500 text-xs">Adicione produtos para continuar</p>
                </div>
              </div>

            </div>
            {showCode && (
              <code className="text-xs text-gray-400 block mt-4 p-3 bg-gray-900/60 rounded">
{`// Cart Badge Component
<div className="relative">
  <ShoppingCart className="w-8 h-8 text-gray-300" />
  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white">
    {cartItems}
  </Badge>
</div>

// Empty Cart State
<div className="text-center py-8">
  <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
  <p className="text-gray-300 mb-1">Carrinho vazio</p>
  <p className="text-gray-500 text-sm">Adicione produtos para continuar</p>
</div>`}
              </code>
            )}
          </div>

          {/* Advanced Search Bar Preview */}
          <div>
            <h4 className={getSFProTextClasses('h4', 'accent')}>Advanced Search Bar (SearchBar21st)</h4>
            <div className={cn(getGlassCardClasses('default'), 'p-4')}>
              <h5 className="text-accent-purple font-sf-medium text-sm mb-3">Search with Gooey Effects</h5>
              <div className="relative">
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar produtos..."
                  className="bg-black/50 border-amber-400/30 text-white placeholder:text-gray-400 focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Search className="w-4 h-4 text-amber-400/70" />
                </div>
              </div>
              <p className="text-gray-400 text-xs mt-2">
                ⚡ SearchBar21st tem efeitos magnéticos, glow e pointer follower
              </p>
            </div>
            {showCode && (
              <code className="text-xs text-gray-400 block mt-4 p-3 bg-gray-900/60 rounded">
{`// SearchBar21st Component (Advanced)
<SearchBar21st
  value={searchTerm}
  onChange={setSearchTerm}
  placeholder="Buscar produtos..."
  debounceMs={150}
  disableResizeAnimation={true}
  // Features: gooey filter effects, magnetic glow, pointer follower
/>

// Fallback Input Style
<Input
  className="bg-black/50 border-amber-400/30 text-white 
             placeholder:text-gray-400 focus:border-amber-400/60 
             focus:ring-2 focus:ring-amber-400/20"
/>`}
              </code>
            )}
          </div>

          {/* Payment Method Selector */}
          <div>
            <h4 className={getSFProTextClasses('h4', 'accent')}>Payment Method Selector</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={cn(
                    'p-3 rounded-lg border cursor-pointer transition-all duration-200 text-center',
                    'backdrop-blur-sm hover:scale-105',
                    paymentMethod === method.id
                      ? 'bg-amber-400/20 border-amber-400/40 text-amber-300 ring-2 ring-amber-400/30'
                      : 'bg-black/40 border-white/20 text-gray-300 hover:border-white/40'
                  )}
                >
                  <div className="text-2xl mb-1">{method.icon}</div>
                  <p className="text-xs font-medium">{method.label}</p>
                </div>
              ))}
            </div>
            {showCode && (
              <code className="text-xs text-gray-400 block mt-4 p-3 bg-gray-900/60 rounded">
{`// Payment Method Selector
const paymentMethods = [
  { id: 'dinheiro', label: 'Dinheiro', icon: '💵' },
  { id: 'cartao', label: 'Cartão', icon: '💳' },
  { id: 'pix', label: 'PIX', icon: '📱' },
  { id: 'fiado', label: 'Fiado', icon: '📋' }
];

{paymentMethods.map((method) => (
  <div key={method.id} onClick={() => setPaymentMethod(method.id)}
       className={cn('p-3 rounded-lg border cursor-pointer text-center',
         paymentMethod === method.id 
           ? 'bg-amber-400/20 border-amber-400/40 text-amber-300' 
           : 'bg-black/40 border-white/20 text-gray-300')}>
    <div className="text-2xl mb-1">{method.icon}</div>
    <p className="text-xs font-medium">{method.label}</p>
  </div>
))}`}
              </code>
            )}
          </div>

          {/* Tab Navigation System */}
          <div>
            <h4 className={getSFProTextClasses('h4', 'accent')}>Tab Navigation (Sales Page Style)</h4>
            <div className={cn(getGlassCardClasses('default'), 'p-4')}>
              <h5 className="text-accent-yellow font-sf-medium text-sm mb-3">Yellow Accent Tabs</h5>
              <div className="inline-flex h-10 items-center justify-center rounded-md bg-black/70 backdrop-blur-xl border border-yellow-400/20 p-1 shadow-lg">
                <button className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 transition-all bg-yellow-400/20 text-yellow-400 shadow-sm font-sf-medium text-sm">
                  NOVA VENDA
                </button>
                <button className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 transition-all text-gray-300 hover:text-yellow-300 font-sf-medium text-sm">
                  VENDAS RECENTES
                </button>
              </div>
            </div>
            {showCode && (
              <code className="text-xs text-gray-400 block mt-4 p-3 bg-gray-900/60 rounded">
{`// Tab Navigation - Sales Page Style
<div className="inline-flex h-10 items-center justify-center rounded-md 
                bg-black/70 backdrop-blur-xl border border-yellow-400/20 p-1 shadow-lg">
  <button className={cn(
    "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 transition-all",
    activeTab === 'new-sale' 
      ? "bg-yellow-400/20 text-yellow-400 shadow-sm" 
      : "text-gray-300 hover:text-yellow-300"
  )}>
    NOVA VENDA
  </button>
  <button className="text-gray-300 hover:text-yellow-300 px-3 py-1.5">
    VENDAS RECENTES
  </button>
</div>`}
              </code>
            )}
          </div>

        </CardContent>
      </Card>
    </div>
  );
}

// Seção Inventory - Inventory & Stock Management Components
function InventorySection({ showCode }: { showCode: boolean }) {
  const [stockType, setStockType] = useState('entrada');
  const [barcodeValue, setBarcodeValue] = useState('');
  const [turnoverFilter, setTurnoverFilter] = useState('all');
  const [alertsCount, setAlertsCount] = useState(3);
  
  const stockTypes = [
    { 
      id: 'entrada', 
      label: 'Entrada', 
      description: 'Recebimento de mercadoria',
      color: 'text-green-400 border-green-400/30 bg-green-400/10',
      icon: '➕'
    },
    { 
      id: 'saida', 
      label: 'Saída', 
      description: 'Retirada de produtos',
      color: 'text-red-400 border-red-400/30 bg-red-400/10',
      icon: '➖'
    },
    { 
      id: 'ajuste', 
      label: 'Correção', 
      description: 'Inventário e acertos',
      color: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10',
      icon: '⚙️'
    }
  ];

  const stockStatuses = [
    { id: 'out', label: 'Sem Estoque', count: 2, color: 'bg-red-500/20 text-red-400 border-red-400/30' },
    { id: 'low', label: 'Estoque Baixo', count: 8, color: 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30' },
    { id: 'available', label: 'Disponível', count: 75, color: 'bg-green-500/20 text-green-400 border-green-400/30' },
    { id: 'excess', label: 'Excesso', count: 12, color: 'bg-blue-500/20 text-blue-400 border-blue-400/30' }
  ];

  const turnoverRates = [
    { id: 'fast', label: 'Giro Rápido', count: 23, color: 'text-green-400', icon: '📈' },
    { id: 'medium', label: 'Giro Médio', count: 58, color: 'text-yellow-400', icon: '📊' },
    { id: 'slow', label: 'Giro Devagar', count: 16, color: 'text-red-400', icon: '📉' }
  ];

  return (
    <div className="space-y-6">
      <Card className={getGlassCardClasses('default')}>
        <CardHeader>
          <CardTitle className={getSFProTextClasses('h3', 'accent')}>
            📦 Inventory & Stock
          </CardTitle>
          <p className={getSFProTextClasses('body', 'secondary')}>
            Estoque, códigos de barras, análise de giro
          </p>
        </CardHeader>
        <CardContent className="space-y-8">

          {/* Barcode Input Component */}
          <div>
            <h4 className={getSFProTextClasses('h4', 'accent')}>Barcode Input Component</h4>
            <div className="space-y-4 mt-4">
              
              <div className={cn(getGlassCardClasses('default'), 'p-4')}>
                <h5 className="text-accent-blue font-sf-medium text-sm mb-3">Input para Códigos de Barras</h5>
                <div className="flex gap-2 items-center">
                  <Input
                    value={barcodeValue}
                    onChange={(e) => setBarcodeValue(e.target.value.replace(/\D/g, ''))}
                    placeholder="Escaneie ou digite o código de barras"
                    maxLength={14}
                    className="font-mono text-lg h-12 bg-gray-800/50 border-purple-400/30 text-white placeholder:text-gray-400 focus:border-purple-400/60 focus:ring-2 focus:ring-purple-400/20"
                  />
                  <Button
                    variant="outline"
                    className="h-12 px-3 border-purple-400/30 text-purple-400 hover:bg-purple-400/10"
                    disabled={!barcodeValue || barcodeValue.length < 8}
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                {barcodeValue && barcodeValue.length >= 8 && (
                  <p className="text-sm text-green-400 mt-2">
                    ✅ Formato detectado: EAN-{barcodeValue.length}
                  </p>
                )}
                {barcodeValue && barcodeValue.length > 0 && barcodeValue.length < 8 && (
                  <p className="text-sm text-red-400 mt-2">
                    ⚠️ Código inválido. Mínimo 8 dígitos.
                  </p>
                )}
              </div>

            </div>
            {showCode && (
              <code className="text-xs text-gray-400 block mt-4 p-3 bg-gray-900/60 rounded">
{`// Barcode Input - Specialized for inventory
<div className="flex gap-2 items-center">
  <Input
    value={barcode}
    onChange={(e) => setBarcode(e.target.value.replace(/\\D/g, ''))} // Apenas números
    placeholder="Escaneie ou digite o código de barras"
    maxLength={14}
    className="font-mono text-lg h-12 bg-gray-800/50 border-purple-400/30"
  />
  <Button variant="outline" className="h-12 px-3" disabled={!isValid}>
    <Search className="h-4 w-4" />
  </Button>
</div>

// Features:
- Font monospace para códigos
- Validação EAN-8/EAN-13/UPC
- Estados visuais (válido/inválido)
- Altura fixa h-12`}
              </code>
            )}
          </div>

          {/* Stock Adjustment Types */}
          <div>
            <h4 className={getSFProTextClasses('h4', 'accent')}>Stock Adjustment Types</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {stockTypes.map((type) => (
                <div 
                  key={type.id}
                  onClick={() => setStockType(type.id)}
                  className={cn(
                    'relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-300',
                    'hover:scale-105 hover:shadow-lg transform',
                    stockType === type.id 
                      ? type.color + ' ring-2 ring-white/20 shadow-lg' 
                      : 'border-gray-600/50 bg-black/20 hover:border-gray-400/50'
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{type.icon}</div>
                    <div className="flex-1">
                      <div className="font-medium text-sm mb-1">{type.label}</div>
                      <div className="text-xs opacity-80">{type.description}</div>
                    </div>
                    {stockType === type.id && (
                      <div className="absolute -top-1 -right-1">
                        <div className="w-3 h-3 bg-current rounded-full animate-ping"></div>
                        <div className="absolute top-0 w-3 h-3 bg-current rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {showCode && (
              <code className="text-xs text-gray-400 block mt-4 p-3 bg-gray-900/60 rounded">
{`// Stock Adjustment Types - Interactive tri-state
const stockTypes = [
  { id: 'entrada', label: 'Entrada', color: 'text-green-400 border-green-400/30 bg-green-400/10' },
  { id: 'saida', label: 'Saída', color: 'text-red-400 border-red-400/30 bg-red-400/10' },
  { id: 'ajuste', label: 'Correção', color: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10' }
];

<div className={cn(
  'p-4 rounded-lg border-2 cursor-pointer transition-all duration-300',
  'hover:scale-105 hover:shadow-lg transform',
  selected ? type.color + ' ring-2 ring-white/20 shadow-lg' : 'border-gray-600/50'
)}>
  {/* Ping animation para selecionado */}
  {selected && (
    <div className="absolute -top-1 -right-1">
      <div className="w-3 h-3 bg-current rounded-full animate-ping"></div>
    </div>
  )}
</div>`}
              </code>
            )}
          </div>

          {/* Stock Status Badges */}
          <div>
            <h4 className={getSFProTextClasses('h4', 'accent')}>Stock Status Badges</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {stockStatuses.map((status) => (
                <div key={status.id} className={cn(getGlassCardClasses('default'), 'p-4 text-center')}>
                  <Badge className={cn("mb-3 px-3 py-1 text-sm font-medium", status.color)}>
                    {status.label}
                  </Badge>
                  <div className="text-2xl font-bold text-white">{status.count}</div>
                  <p className="text-xs text-gray-400 mt-1">produtos</p>
                </div>
              ))}
            </div>
            {showCode && (
              <code className="text-xs text-gray-400 block mt-4 p-3 bg-gray-900/60 rounded">
{`// Stock Status Badges - 4 estados principais
const getStockStatus = (currentStock: number, minStock: number = 10) => {
  if (currentStock === 0) 
    return { status: 'out', label: 'Sem Estoque', color: 'bg-red-500/20 text-red-400 border-red-400/30' };
  if (currentStock <= minStock) 
    return { status: 'low', label: 'Estoque Baixo', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30' };
  if (currentStock > minStock * 3) 
    return { status: 'excess', label: 'Excesso', color: 'bg-blue-500/20 text-blue-400 border-blue-400/30' };
  return { status: 'available', label: 'Disponível', color: 'bg-green-500/20 text-green-400 border-green-400/30' };
};

<Badge className={cn("px-3 py-1 text-sm font-medium", status.color)}>
  {status.label}
</Badge>`}
              </code>
            )}
          </div>

          {/* Turnover Analysis */}
          <div>
            <h4 className={getSFProTextClasses('h4', 'accent')}>Turnover Analysis (Análise de Giro)</h4>
            <div className="space-y-4 mt-4">
              
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {turnoverRates.map((rate) => (
                  <div key={rate.id} className={cn(getGlassCardClasses('default'), 'p-4')}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={cn("text-sm font-medium mb-1", rate.color)}>
                          {rate.label}
                        </div>
                        <div className="text-2xl font-bold text-white">{rate.count}</div>
                      </div>
                      <div className="text-2xl">{rate.icon}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Filter */}
              <div className={cn(getGlassCardClasses('default'), 'p-4')}>
                <h5 className="text-accent-green font-sf-medium text-sm mb-3">Filtros de Análise</h5>
                <div className="flex gap-4">
                  <Select value={turnoverFilter} onValueChange={setTurnoverFilter}>
                    <SelectTrigger className="w-48 bg-gray-800/50 border-green-400/30 text-white">
                      <SelectValue placeholder="Filtrar por período" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900/95 border-white/20 backdrop-blur-xl">
                      <SelectItem value="all" className="text-white hover:bg-white/10">Todos os períodos</SelectItem>
                      <SelectItem value="30" className="text-white hover:bg-white/10">Últimos 30 dias</SelectItem>
                      <SelectItem value="60" className="text-white hover:bg-white/10">Últimos 60 dias</SelectItem>
                      <SelectItem value="90" className="text-white hover:bg-white/10">Últimos 90 dias</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

            </div>
            {showCode && (
              <code className="text-xs text-gray-400 block mt-4 p-3 bg-gray-900/60 rounded">
{`// Turnover Analysis - Giro de produtos
const getTurnoverAnalysis = (turnoverRate: string) => {
  switch (turnoverRate) {
    case 'fast': return { rate: 'Rápido', icon: TrendingUp, color: 'text-green-400' };
    case 'slow': return { rate: 'Devagar', icon: TrendingDown, color: 'text-red-400' };
    case 'medium':
    default: return { rate: 'Médio', icon: Minus, color: 'text-yellow-400' };
  }
};

// Layout em cards de resumo
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  {turnoverRates.map((rate) => (
    <div className="p-4 bg-glass rounded-lg">
      <div className="flex items-center justify-between">
        <div className={rate.color}>{rate.label}</div>
        <div className="text-2xl">{rate.icon}</div>
      </div>
    </div>
  ))}
</div>`}
              </code>
            )}
          </div>

          {/* Expiry Alerts */}
          <div>
            <h4 className={getSFProTextClasses('h4', 'accent')}>Expiry Alerts (Alertas de Validade)</h4>
            <div className="space-y-4 mt-4">
              
              <div className={cn(getGlassCardClasses('default'), 'p-4')}>
                <div className="flex items-center justify-between mb-4">
                  <h5 className="text-orange-400 font-sf-medium text-sm flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Alertas de Validade
                  </h5>
                  <Badge className="bg-red-500/20 text-red-400 border-red-400/30">
                    {alertsCount}
                  </Badge>
                </div>

                {alertsCount > 0 ? (
                  <div className="space-y-3">
                    {/* Critical Alert */}
                    <div className="flex items-start justify-between p-3 rounded-lg border bg-red-900/20 border-red-400/30">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            Vinho Tinto Premium 2019
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
                              Vinhos
                            </Badge>
                            <span className="text-xs text-gray-500">12 unidades</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 ml-2">
                        <Badge variant="destructive" className="text-xs whitespace-nowrap">
                          Vencido há 2 dias
                        </Badge>
                        <span className="text-xs text-gray-500">12/11/2024</span>
                      </div>
                    </div>

                    {/* Warning Alert */}
                    <div className="flex items-start justify-between p-3 rounded-lg border bg-yellow-900/20 border-yellow-400/30">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <Calendar className="h-4 w-4 text-yellow-400 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            Champagne Premium 2020
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
                              Espumantes
                            </Badge>
                            <span className="text-xs text-gray-500">3 unidades</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 ml-2">
                        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-400/30 text-xs whitespace-nowrap">
                          Vence em 5 dias
                        </Badge>
                        <span className="text-xs text-gray-500">19/11/2024</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <CheckCircle className="h-8 w-8 text-green-400 mb-2" />
                    <p className="text-sm text-green-400 font-medium">Tudo em ordem!</p>
                    <p className="text-xs text-gray-500 mt-1">Nenhum produto próximo ao vencimento</p>
                  </div>
                )}

                <div className="mt-4 flex justify-between">
                  <Button size="sm" onClick={() => setAlertsCount(0)} className="bg-green-400/20 text-green-400 hover:bg-green-400/30">
                    Limpar Alertas
                  </Button>
                  <Button size="sm" onClick={() => setAlertsCount(3)} className="bg-red-400/20 text-red-400 hover:bg-red-400/30">
                    Simular Alertas
                  </Button>
                </div>
              </div>

            </div>
            {showCode && (
              <code className="text-xs text-gray-400 block mt-4 p-3 bg-gray-900/60 rounded">
{`// Expiry Alerts - Sistema de urgência
const getUrgencyLevel = (expiryDate: Date) => {
  const daysUntilExpiry = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilExpiry < 0) return { urgency: 'critical', text: \`Vencido há \${Math.abs(daysUntilExpiry)} dias\` };
  if (daysUntilExpiry <= 7) return { urgency: 'warning', text: \`Vence em \${daysUntilExpiry} dias\` };
  if (daysUntilExpiry <= 30) return { urgency: 'info', text: \`Vence em \${daysUntilExpiry} dias\` };
  return { urgency: 'ok', text: 'OK' };
};

// Layout de alerta
<div className="bg-red-900/20 border-red-400/30 p-3 rounded-lg">
  <div className="flex items-start gap-3">
    <AlertTriangle className="h-4 w-4 text-red-400" />
    <div className="flex-1">
      <p className="text-white font-medium truncate">Nome do Produto</p>
      <Badge variant="destructive">Vencido há 2 dias</Badge>
    </div>
  </div>
</div>`}
              </code>
            )}
          </div>

          {/* Inventory Stats Summary */}
          <div>
            <h4 className={getSFProTextClasses('h4', 'accent')}>Inventory Stats (KPIs de Estoque)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              
              <StatCard
                title="Total de Produtos"
                value="97"
                description="cadastrados"
                icon={Package}
                variant="default"
                className="cursor-default"
                onClick={(e) => e.preventDefault()}
              />
              
              <StatCard
                title="Estoque Baixo"
                value="8"
                description="requer atenção"
                icon={AlertTriangle}
                variant="warning"
                className="cursor-default"
                onClick={(e) => e.preventDefault()}
              />
              
              <StatCard
                title="Valor Total"
                value="R$ 45.280"
                description="em estoque"
                icon={DollarSign}
                variant="success"
                className="cursor-default"
                onClick={(e) => e.preventDefault()}
              />
              
              <StatCard
                title="Giro Rápido"
                value="23"
                description="produtos ativos"
                icon={TrendingUp}
                variant="purple"
                className="cursor-default"
                onClick={(e) => e.preventDefault()}
              />
              
            </div>
            {showCode && (
              <code className="text-xs text-gray-400 block mt-4 p-3 bg-gray-900/60 rounded">
{`// Inventory Stats - KPIs específicos para estoque
const inventoryStats = [
  {
    title: "Total de Produtos",
    value: totalProducts.toString(),
    icon: Package,
    variant: "default"
  },
  {
    title: "Estoque Baixo", 
    value: lowStockCount.toString(),
    icon: AlertTriangle,
    variant: lowStockCount > 0 ? "warning" : "success"
  },
  {
    title: "Valor Total",
    value: formatCurrency(totalValue),
    icon: DollarSign, 
    variant: "success"
  },
  {
    title: "Giro Rápido",
    value: turnoverStats.fast.toString(),
    icon: TrendingUp,
    variant: "purple"
  }
];

// Grid layout responsivo
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {inventoryStats.map(stat => (
    <StatCard key={stat.title} {...stat} />
  ))}
</div>`}
              </code>
            )}
          </div>

        </CardContent>
      </Card>
    </div>
  );
}

// ================================================================================================
// SUPPLIERS SECTION - Fornecedores & Parceiros
// ================================================================================================
function SuppliersSection({ showCode }: { showCode: boolean }) {
  const [supplierStatusDemo, setSupplierStatusDemo] = useState(true);
  const [selectedProductDemo, setSelectedProductDemo] = useState('');
  const [paymentMethodsDemo, setPaymentMethodsDemo] = useState(['pix', 'cartao']);
  const [filterTagsDemo, setFilterTagsDemo] = useState([
    { id: 'beer', label: 'Cerveja', color: 'blue' },
    { id: 'card', label: 'Cartão', color: 'green' },
    { id: 'max500', label: 'Máx: R$ 500,00', color: 'yellow' }
  ]);

  const removeFilterTag = (tagId: string) => {
    setFilterTagsDemo(prev => prev.filter(tag => tag.id !== tagId));
  };

  return (
    <div className="space-y-8">
      <Card className={getGlassCardClasses('default')}>
        <CardHeader>
          <CardTitle className={getSFProTextClasses('h2', 'accent')}>
            🏢 Suppliers & Vendors - Fornecedores & Parceiros
          </CardTitle>
          <p className="text-gray-400">
            Sistema completo de gestão de fornecedores com cards corporativos, 
            formulários seccionados, filtros avançados e integração comercial.
          </p>
        </CardHeader>
        <CardContent className="space-y-8">

          {/* Supplier Status Cards */}
          <div>
            <h4 className={getSFProTextClasses('h4', 'accent')}>Supplier Status Cards (Cards de Status)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              
              {/* Ativo */}
              <Card className="bg-black/70 backdrop-blur-xl border border-indigo-500/30 hover:border-indigo-400/60 transition-all duration-300 shadow-xl hover:shadow-indigo-500/20 group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="p-2 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex-shrink-0 backdrop-blur-sm">
                        <Building2 className="h-5 w-5 text-indigo-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white text-lg truncate">
                          Distribuidora São Paulo Ltda
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-green-400 border-green-400/50 bg-green-500/10 backdrop-blur-sm">
                            <Eye className="h-3 w-3 mr-1" />
                            Ativo
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-gray-400 flex items-center gap-1">
                      <span className="h-3 w-3">📞</span>
                      Contato:
                    </div>
                    <span className="text-xs text-white truncate flex-1">(11) 99999-9999</span>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Package className="h-3 w-3" />
                      Produtos
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-xs bg-indigo-500/20 border-indigo-400/30 text-indigo-200">
                        Cerveja
                      </Badge>
                      <Badge variant="secondary" className="text-xs bg-indigo-500/20 border-indigo-400/30 text-indigo-200">
                        Vinho
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 py-2 border-y border-white/10">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Calendar className="h-3 w-3" />
                        Entrega
                      </div>
                      <p className="text-xs text-white truncate">2-3 dias úteis</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <DollarSign className="h-3 w-3" />
                        Mín. Pedido
                      </div>
                      <p className="text-xs text-white truncate">R$ 500,00</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Inativo */}
              <Card className="bg-black/70 backdrop-blur-xl border border-gray-500/30 hover:border-gray-400/60 transition-all duration-300 shadow-xl hover:shadow-gray-500/20 group opacity-60">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="p-2 rounded-lg bg-gray-500/20 border border-gray-400/30 flex-shrink-0 backdrop-blur-sm">
                        <Building2 className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white text-lg truncate">
                          Empresa Desativada Ltda
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-gray-400 border-gray-400/50 bg-gray-500/10 backdrop-blur-sm">
                            <XCircle className="h-3 w-3 mr-1" />
                            Inativo
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-gray-400 flex items-center gap-1">
                      <span className="h-3 w-3">📞</span>
                      Contato:
                    </div>
                    <span className="text-xs text-gray-500 truncate flex-1">Não disponível</span>
                  </div>
                </CardContent>
              </Card>

            </div>
            {showCode && (
              <code className="text-xs text-gray-400 block mt-4 p-3 bg-gray-900/60 rounded">
{`// Supplier Card com status ativo/inativo
<Card className={cn(
  "bg-black/70 backdrop-blur-xl border border-indigo-500/30",
  "hover:border-indigo-400/60 transition-all duration-300",
  "shadow-xl hover:shadow-indigo-500/20 group",
  !supplier.is_active && "opacity-60"
)}>
  <CardHeader className="pb-3">
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="p-2 rounded-lg bg-indigo-500/20 border border-indigo-400/30 backdrop-blur-sm">
          <Building2 className="h-5 w-5 text-indigo-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white text-lg truncate">
            {supplier.company_name}
          </h3>
          <Badge variant="outline" className={cn(
            supplier.is_active 
              ? "text-green-400 border-green-400/50 bg-green-500/10" 
              : "text-gray-400 border-gray-400/50 bg-gray-500/10"
          )}>
            {supplier.is_active ? <Eye className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
            {supplier.is_active ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>
      </div>
    </div>
  </CardHeader>
</Card>`}
              </code>
            )}
          </div>

          {/* Dynamic Product Form */}
          <div>
            <h4 className={getSFProTextClasses('h4', 'accent')}>Dynamic Product Selection (Produtos Dinâmicos)</h4>
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-2">
                <Input
                  value={selectedProductDemo}
                  onChange={(e) => setSelectedProductDemo(e.target.value)}
                  placeholder="Ex: Cerveja, Vinho, Refrigerante..."
                  className="flex-1 bg-black/70 border-white/30 text-white placeholder:text-gray-400"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-10 w-10 p-0 hover:bg-red-500/20 hover:text-red-400"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-10 w-10 p-0 hover:bg-green-500/20 hover:text-green-400"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="text-xs text-gray-400">
                ↑ Produtos fornecidos com botões +/- para adicionar/remover dinamicamente
              </div>
            </div>
            {showCode && (
              <code className="text-xs text-gray-400 block mt-4 p-3 bg-gray-900/60 rounded">
{`// Formulário de produtos dinâmico
{customProducts.map((product, index) => (
  <div key={index} className="flex items-center gap-2">
    <Input
      value={product}
      onChange={(e) => handleProductChange(index, e.target.value)}
      placeholder="Ex: Cerveja, Vinho, Refrigerante..."
      className="flex-1 bg-black/70 border-white/30 text-white"
    />
    {customProducts.length > 1 && (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => handleRemoveProduct(index)}
        className="h-10 w-10 p-0 hover:bg-red-500/20 hover:text-red-400"
      >
        <Minus className="h-4 w-4" />
      </Button>
    )}
    {index === customProducts.length - 1 && (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleAddProduct}
        className="h-10 w-10 p-0 hover:bg-green-500/20 hover:text-green-400"
      >
        <Plus className="h-4 w-4" />
      </Button>
    )}
  </div>
))}`}
              </code>
            )}
          </div>

          {/* Payment Methods Grid */}
          <div>
            <h4 className={getSFProTextClasses('h4', 'accent')}>Payment Methods Grid (Formas de Pagamento)</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
              {[
                { id: 'pix', label: 'PIX' },
                { id: 'cartao', label: 'Cartão' },
                { id: 'boleto', label: 'Boleto' },
                { id: 'dinheiro', label: 'Dinheiro' },
                { id: 'prazo', label: 'A Prazo' },
                { id: 'deposito', label: 'Depósito' }
              ].map((method) => (
                <div key={method.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={method.id}
                    checked={paymentMethodsDemo.includes(method.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setPaymentMethodsDemo(prev => [...prev, method.id]);
                      } else {
                        setPaymentMethodsDemo(prev => prev.filter(p => p !== method.id));
                      }
                    }}
                    className="rounded border-white/30 bg-transparent text-primary-yellow focus:ring-primary-yellow"
                  />
                  <label htmlFor={method.id} className="text-sm text-gray-300 cursor-pointer">
                    {method.label}
                  </label>
                </div>
              ))}
            </div>
            {showCode && (
              <code className="text-xs text-gray-400 block mt-4 p-3 bg-gray-900/60 rounded">
{`// Grid de checkboxes para formas de pagamento
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
  {PAYMENT_METHODS_OPTIONS.map((method) => (
    <div key={method.value} className="flex items-center space-x-2">
      <Checkbox
        id={method.value}
        checked={formData.payment_methods?.includes(method.value) || false}
        onCheckedChange={(checked) => 
          handlePaymentMethodToggle(method.value, checked as boolean)
        }
        className="border-white/30 data-[state=checked]:bg-primary-yellow"
      />
      <Label htmlFor={method.value} className="text-sm text-gray-300 cursor-pointer">
        {method.label}
      </Label>
    </div>
  ))}
</div>`}
              </code>
            )}
          </div>

          {/* Filter Tags System */}
          <div>
            <h4 className={getSFProTextClasses('h4', 'accent')}>Filter Tags System (Sistema de Tags)</h4>
            <div className="flex flex-wrap gap-2 mt-4">
              {filterTagsDemo.map((tag) => (
                <div
                  key={tag.id}
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded text-sm",
                    tag.color === 'blue' && "bg-blue-500/20 text-blue-300",
                    tag.color === 'green' && "bg-green-500/20 text-green-300", 
                    tag.color === 'yellow' && "bg-yellow-500/20 text-yellow-300",
                    tag.color === 'red' && "bg-red-500/20 text-red-300"
                  )}
                >
                  {tag.label}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-white/10"
                    onClick={() => removeFilterTag(tag.id)}
                  >
                    <XCircle className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              
              {filterTagsDemo.length === 0 && (
                <div className="text-sm text-gray-500 italic">
                  Nenhum filtro ativo
                </div>
              )}
            </div>
            {showCode && (
              <code className="text-xs text-gray-400 block mt-4 p-3 bg-gray-900/60 rounded">
{`// Sistema de tags de filtros removíveis
{activeFilters.map((filter) => (
  <div
    key={filter.id}
    className={cn(
      "flex items-center gap-1 px-2 py-1 rounded text-sm",
      filter.type === 'product' && "bg-blue-500/20 text-blue-300",
      filter.type === 'payment' && "bg-green-500/20 text-green-300",
      filter.type === 'value' && "bg-yellow-500/20 text-yellow-300",
      filter.type === 'status' && "bg-red-500/20 text-red-300"
    )}
  >
    {filter.label}
    <Button
      variant="ghost"
      size="sm"
      className="h-4 w-4 p-0 hover:bg-white/10"
      onClick={() => removeFilter(filter.id)}
    >
      <X className="h-3 w-3" />
    </Button>
  </div>
))}`}
              </code>
            )}
          </div>

          {/* Suppliers Stats Summary */}
          <div>
            <h4 className={getSFProTextClasses('h4', 'accent')}>Suppliers Stats (KPIs de Fornecedores)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              
              <StatCard
                title="Total de Fornecedores"
                value="24"
                description="cadastrados"
                icon={Building2}
                variant="default"
                className="cursor-default"
                onClick={(e) => e.preventDefault()}
              />
              
              <StatCard
                title="Fornecedores Ativos"
                value="22"
                description="em atividade"
                icon={Building2}
                variant="success"
                className="cursor-default"
                onClick={(e) => e.preventDefault()}
              />
              
              <StatCard
                title="Categorias de Produtos"
                value="8"
                description="fornecidas"
                icon={Package}
                variant="purple"
                className="cursor-default"
                onClick={(e) => e.preventDefault()}
              />
              
              <StatCard
                title="Taxa de Atividade"
                value="92%"
                description="fornecedores ativos"
                icon={TrendingUp}
                variant="warning"
                className="cursor-default"
                onClick={(e) => e.preventDefault()}
              />
              
            </div>
            {showCode && (
              <code className="text-xs text-gray-400 block mt-4 p-3 bg-gray-900/60 rounded">
{`// Supplier Stats - KPIs específicos para fornecedores
const supplierStats = [
  {
    title: "Total de Fornecedores",
    value: stats.total_suppliers.toString(),
    icon: Building2,
    variant: "default"
  },
  {
    title: "Fornecedores Ativos", 
    value: stats.active_suppliers.toString(),
    icon: Building2,
    variant: "success"
  },
  {
    title: "Categorias de Produtos",
    value: stats.total_product_categories.toString(),
    icon: Package, 
    variant: "purple"
  },
  {
    title: "Taxa de Atividade",
    value: \`\${Math.round((stats.active_suppliers / stats.total_suppliers) * 100)}%\`,
    icon: TrendingUp,
    variant: "warning"
  }
];

// Grid layout responsivo
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {supplierStats.map(stat => (
    <StatCard key={stat.title} {...stat} />
  ))}
</div>`}
              </code>
            )}
          </div>

        </CardContent>
      </Card>
    </div>
  );
}

// ================================================================================================
// CUSTOMERS SECTION - Clientes & CRM
// ================================================================================================
function CustomersSection({ showCode }: { showCode: boolean }) {
  const [selectedSegment, setSelectedSegment] = useState('VIP');
  const [insightConfidence, setInsightConfidence] = useState(85);
  const [customerTags, setCustomerTags] = useState(['Frequente', 'Premium', 'Cidade']);
  const [profileCompleteness, setProfileCompleteness] = useState(75);

  const getInsightColor = (confidence: number) => {
    if (confidence >= 80) return 'success';
    if (confidence >= 60) return 'warning';
    return 'error';
  };

  const getTagColor = (tag: string) => {
    const colors = ['blue', 'green', 'purple', 'orange', 'red', 'yellow'];
    const index = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  const getProfileColor = (completeness: number) => {
    if (completeness >= 80) return 'bg-green-500';
    if (completeness >= 60) return 'bg-yellow-500';
    if (completeness >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-8">
      <Card className={getGlassCardClasses('default')}>
        <CardHeader>
          <CardTitle className={getSFProTextClasses('h2', 'accent')}>
            👥 Customers & CRM - Clientes & Relacionamento
          </CardTitle>
          <p className="text-gray-400">
            Sistema completo de CRM com segmentação inteligente, insights de IA, 
            gestão de tags personalizáveis e indicadores de completude de perfil.
          </p>
        </CardHeader>
        <CardContent className="space-y-8">

          {/* Customer Segment Badges */}
          <div>
            <h4 className={getSFProTextClasses('h4', 'accent')}>Customer Segment Badges (Badges de Segmentação)</h4>
            <div className="space-y-4 mt-4">
              
              <div className="flex flex-wrap gap-3">
                {[
                  { segment: 'VIP', icon: Crown },
                  { segment: 'Regular', icon: Users },
                  { segment: 'Ativo', icon: UserCheck },
                  { segment: 'Novo', icon: UserPlus }
                ].map(({ segment, icon: Icon }) => (
                  <Badge
                    key={segment}
                    variant="outline"
                    className={cn(
                      'flex items-center gap-1 cursor-pointer transition-all',
                      segment === 'VIP' && 'border-primary-yellow/60 text-primary-yellow bg-primary-yellow/10 font-bold',
                      segment === 'Regular' && 'border-accent-green/60 text-accent-green bg-accent-green/10 font-semibold',
                      segment === 'Ativo' && 'border-accent-blue/60 text-accent-blue bg-accent-blue/10 font-medium',
                      segment === 'Novo' && 'border-gray-400/60 text-gray-300 bg-gray-400/10 font-normal border-dashed',
                      selectedSegment === segment && 'ring-2 ring-current ring-opacity-50'
                    )}
                    onClick={() => setSelectedSegment(segment)}
                  >
                    <Icon className="h-3 w-3" />
                    {segment}
                  </Badge>
                ))}
              </div>

              <div className="text-xs text-gray-400 mt-2">
                ↑ Clique nos badges para testar a seleção - cada segmento tem cor e ícone específico
              </div>
            </div>
            
            {showCode && (
              <code className="text-xs text-gray-400 block mt-4 p-3 bg-gray-900/60 rounded">
{`// Customer Segment Badge com ícones e cores específicas
const getSegmentIcon = (segment: string) => {
  switch (segment.toLowerCase()) {
    case 'vip': return Crown;
    case 'regular': return Users;
    case 'ativo': return UserCheck;
    case 'novo': return UserPlus;
    default: return CircleHelp;
  }
};

const getSegmentPattern = (segment: string) => {
  switch (segment.toLowerCase()) {
    case 'vip':
      return 'font-bold border-2 border-primary-yellow/60 text-primary-yellow bg-primary-yellow/10';
    case 'regular':
      return 'font-semibold border-accent-green/60 text-accent-green bg-accent-green/10';
    case 'ativo':
      return 'font-medium border-accent-blue/60 text-accent-blue bg-accent-blue/10';
    case 'novo':
      return 'font-normal border-dashed border-gray-400 text-gray-300 bg-gray-400/10';
    default:
      return 'font-light opacity-75 border-gray-500 text-gray-400 bg-gray-500/10';
  }
};

<Badge className={cn(getSegmentPattern(segment))} variant="outline">
  <Icon className="h-3 w-3 mr-1" />
  {segment}
</Badge>`}
              </code>
            )}
          </div>

          {/* AI Insights Badges */}
          <div>
            <h4 className={getSFProTextClasses('h4', 'accent')}>AI Insights Badges (Badges de Insights IA)</h4>
            <div className="space-y-4 mt-4">
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-300">Confiança do Insight:</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={insightConfidence}
                    onChange={(e) => setInsightConfidence(Number(e.target.value))}
                    className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-sm text-white font-medium w-12">{insightConfidence}%</span>
                </div>
                
                <Badge
                  variant="outline"
                  className={cn(
                    'flex items-center gap-2 w-fit',
                    insightConfidence >= 80 && 'border-green-400/60 text-green-400 bg-green-500/10',
                    insightConfidence >= 60 && insightConfidence < 80 && 'border-yellow-400/60 text-yellow-400 bg-yellow-500/10',
                    insightConfidence < 60 && 'border-red-400/60 text-red-400 bg-red-500/10'
                  )}
                >
                  <Brain className="h-3 w-3" />
                  3 insights ({insightConfidence}%)
                </Badge>
              </div>

              <div className="text-xs text-gray-400">
                ↑ Ajuste o slider para ver como a cor do badge muda com base na confiança
              </div>
            </div>
            
            {showCode && (
              <code className="text-xs text-gray-400 block mt-4 p-3 bg-gray-900/60 rounded">
{`// AI Insights Badge com cor baseada na confiança
const getInsightBadgeColor = (confidence: number) => {
  if (confidence >= 80) return 'border-green-400/60 text-green-400 bg-green-500/10';
  if (confidence >= 60) return 'border-yellow-400/60 text-yellow-400 bg-yellow-500/10';
  return 'border-red-400/60 text-red-400 bg-red-500/10';
};

// Agregação de insights com confiança média
const aggregatedInsights = customerInsights.reduce((acc, insight) => {
  const avgConfidence = acc.confidence 
    ? (acc.confidence + insight.confidence) / 2 
    : insight.confidence;
  
  return {
    count: acc.count + 1,
    confidence: avgConfidence
  };
}, { count: 0, confidence: 0 });

<Badge className={cn("flex items-center gap-1", getInsightBadgeColor(aggregatedInsights.confidence))}>
  <Brain className="w-3 h-3" />
  {aggregatedInsights.count} insights ({Math.round(aggregatedInsights.confidence * 100)}%)
</Badge>`}
              </code>
            )}
          </div>

          {/* Customer Tags Manager */}
          <div>
            <h4 className={getSFProTextClasses('h4', 'accent')}>Customer Tags Manager (Gerenciador de Tags)</h4>
            <div className="space-y-4 mt-4">
              
              <div className="flex flex-wrap gap-2">
                {customerTags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className={cn(
                      'flex items-center gap-1 cursor-pointer transition-all',
                      getTagColor(tag) === 'blue' && 'border-blue-400/60 text-blue-400 bg-blue-500/10',
                      getTagColor(tag) === 'green' && 'border-green-400/60 text-green-400 bg-green-500/10',
                      getTagColor(tag) === 'purple' && 'border-purple-400/60 text-purple-400 bg-purple-500/10',
                      getTagColor(tag) === 'orange' && 'border-orange-400/60 text-orange-400 bg-orange-500/10',
                      getTagColor(tag) === 'red' && 'border-red-400/60 text-red-400 bg-red-500/10',
                      getTagColor(tag) === 'yellow' && 'border-yellow-400/60 text-yellow-400 bg-yellow-500/10'
                    )}
                    onClick={() => setCustomerTags(prev => prev.filter(t => t !== tag))}
                  >
                    <Tag className="h-3 w-3" />
                    {tag}
                    <XCircle className="h-3 w-3 ml-1 hover:text-red-400" />
                  </Badge>
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCustomerTags(prev => [...prev, 'Nova Tag'])}
                  className="text-cyan-400 border-cyan-400/50 hover:bg-cyan-500/10"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Adicionar Tag
                </Button>
              </div>

              <div className="text-xs text-gray-400">
                ↑ Clique nas tags para removê-las ou adicione novas - cores são geradas por hash
              </div>
            </div>
            
            {showCode && (
              <code className="text-xs text-gray-400 block mt-4 p-3 bg-gray-900/60 rounded">
{`// Customer Tags com cores baseadas em hash
const TAG_COLORS = [
  'blue', 'green', 'purple', 'orange', 'red', 'yellow', 'indigo', 'pink'
];

const getTagColor = useCallback((tag: string): string => {
  const index = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return TAG_COLORS[index % TAG_COLORS.length];
}, []);

const getTagClasses = (color: string) => {
  const colorMap = {
    blue: 'border-blue-400/60 text-blue-400 bg-blue-500/10',
    green: 'border-green-400/60 text-green-400 bg-green-500/10',
    purple: 'border-purple-400/60 text-purple-400 bg-purple-500/10',
    orange: 'border-orange-400/60 text-orange-400 bg-orange-500/10',
    red: 'border-red-400/60 text-red-400 bg-red-500/10',
    yellow: 'border-yellow-400/60 text-yellow-400 bg-yellow-500/10'
  };
  return colorMap[color] || colorMap.blue;
};

<Badge className={cn("flex items-center gap-1", getTagClasses(getTagColor(tag)))}>
  <Tag className="h-3 w-3" />
  {tag}
  <XCircle className="h-3 w-3 ml-1 hover:text-red-400 cursor-pointer" 
           onClick={() => removeTag(tag)} />
</Badge>`}
              </code>
            )}
          </div>

          {/* Profile Completeness */}
          <div>
            <h4 className={getSFProTextClasses('h4', 'accent')}>Profile Completeness (Completude do Perfil)</h4>
            <div className="space-y-4 mt-4">
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-300">Completude do Perfil:</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={profileCompleteness}
                    onChange={(e) => setProfileCompleteness(Number(e.target.value))}
                    className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-sm text-white font-medium w-12">{profileCompleteness}%</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Progresso do perfil</span>
                    <span className="text-white font-medium">{profileCompleteness}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div
                      className={cn(
                        'h-full transition-all duration-300 rounded-full',
                        getProfileColor(profileCompleteness)
                      )}
                      style={{ width: `${profileCompleteness}%` }}
                    />
                  </div>
                  
                  <Badge
                    variant="outline"
                    className={cn(
                      'flex items-center gap-1 w-fit mt-2',
                      profileCompleteness >= 80 && 'border-green-400/60 text-green-400 bg-green-500/10',
                      profileCompleteness >= 60 && profileCompleteness < 80 && 'border-yellow-400/60 text-yellow-400 bg-yellow-500/10',
                      profileCompleteness >= 40 && profileCompleteness < 60 && 'border-orange-400/60 text-orange-400 bg-orange-500/10',
                      profileCompleteness < 40 && 'border-red-400/60 text-red-400 bg-red-500/10'
                    )}
                  >
                    <Target className="h-3 w-3" />
                    {profileCompleteness >= 80 ? 'Completo' : 
                     profileCompleteness >= 60 ? 'Bom' : 
                     profileCompleteness >= 40 ? 'Básico' : 'Incompleto'}
                  </Badge>
                </div>
              </div>

              <div className="text-xs text-gray-400">
                ↑ Ajuste o slider para ver as cores progressivas da barra de completude
              </div>
            </div>
            
            {showCode && (
              <code className="text-xs text-gray-400 block mt-4 p-3 bg-gray-900/60 rounded">
{`// Profile Completeness com cores progressivas
const getProfileCompletenessColor = (percentage: number) => {
  if (percentage >= 80) return 'bg-green-500';
  if (percentage >= 60) return 'bg-yellow-500';
  if (percentage >= 40) return 'bg-orange-500';
  return 'bg-red-500';
};

const getProfileCompletenessLabel = (percentage: number) => {
  if (percentage >= 80) return { label: 'Completo', color: 'border-green-400/60 text-green-400 bg-green-500/10' };
  if (percentage >= 60) return { label: 'Bom', color: 'border-yellow-400/60 text-yellow-400 bg-yellow-500/10' };
  if (percentage >= 40) return { label: 'Básico', color: 'border-orange-400/60 text-orange-400 bg-orange-500/10' };
  return { label: 'Incompleto', color: 'border-red-400/60 text-red-400 bg-red-500/10' };
};

// Cálculo automático da completude
const calculateProfileCompleteness = (customer: CustomerProfile) => {
  const fields = [
    customer.name, customer.email, customer.phone, customer.address,
    customer.birth_date, customer.preferences, customer.notes
  ];
  const filledFields = fields.filter(field => field && field.trim() !== '').length;
  return Math.round((filledFields / fields.length) * 100);
};

<div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
  <div
    className={cn('h-full transition-all duration-300 rounded-full', getProfileCompletenessColor(completeness))}
    style={{ width: \`\${completeness}%\` }}
  />
</div>`}
              </code>
            )}
          </div>

        </CardContent>
      </Card>
    </div>
  );
}

// ================================================================================================
// CRM DASHBOARD SECTION - Dashboard Avançado CRM
// ================================================================================================
function CrmDashboardSection({ showCode }: { showCode: boolean }) {
  const [selectedPeriod, setSelectedPeriod] = useState(30);
  const [activeTab, setActiveTab] = useState('overview');
  const [isExporting, setIsExporting] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());

  const mockBirthdayCustomers = [
    { id: 1, name: 'Maria Silva', daysUntil: 0, isToday: true },
    { id: 2, name: 'João Santos', daysUntil: 1, isToday: false },
    { id: 3, name: 'Ana Costa', daysUntil: 3, isToday: false },
    { id: 4, name: 'Pedro Lima', daysUntil: 7, isToday: false }
  ];

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const getBirthdayIcon = (customer: any) => {
    if (customer.isToday) return (
      <div className="relative">
        <Cake className="h-5 w-5 text-yellow-400 animate-bounce drop-shadow-lg" />
        <div className="absolute -top-1 -right-1 h-2 w-2 bg-yellow-400 rounded-full animate-ping"></div>
      </div>
    );
    if (customer.daysUntil === 1) return <Gift className="h-5 w-5 text-orange-400 drop-shadow-md" />;
    if (customer.daysUntil <= 7) return <Gift className="h-4 w-4 text-purple-400 drop-shadow-sm hover:scale-110 transition-transform" />;
    return <Calendar className="h-4 w-4 text-blue-400 drop-shadow-sm" />;
  };

  const getBirthdayColor = (customer: any) => {
    if (customer.isToday) return 'bg-gradient-to-r from-yellow-500/30 via-orange-500/25 to-yellow-500/30 border-yellow-400/60 text-yellow-100 shadow-lg shadow-yellow-500/20';
    if (customer.daysUntil <= 7) return 'bg-gradient-to-r from-orange-500/25 via-red-500/20 to-orange-500/25 border-orange-400/50 text-orange-100 shadow-md shadow-orange-500/15';
    return 'bg-gradient-to-r from-blue-500/20 via-cyan-500/15 to-blue-500/20 border-blue-400/40 text-blue-100 shadow-md shadow-blue-500/10';
  };

  const formatDaysUntil = (customer: any) => {
    if (customer.isToday) return 'HOJE! 🎉✨';
    if (customer.daysUntil === 1) return 'Amanhã 🎂🎈';
    if (customer.daysUntil <= 3) return `${customer.daysUntil} dias 🎈🎊`;
    return `${customer.daysUntil} dias 🎈🎁`;
  };

  return (
    <div className="space-y-8">
      <Card className={getGlassCardClasses('default')}>
        <CardHeader>
          <CardTitle className={getSFProTextClasses('h2', 'accent')}>
            📊 CRM Dashboard - Dashboard Avançado
          </CardTitle>
          <p className="text-gray-400">
            Componentes avançados de dashboard CRM com animações personalizadas, 
            sistema de calendário, exportação e controles interativos.
          </p>
        </CardHeader>
        <CardContent className="space-y-8">

          {/* BlurIn Animated Headers */}
          <div>
            <h4 className={getSFProTextClasses('h4', 'accent')}>BlurIn Animated Headers (Cabeçalhos Animados)</h4>
            <div className="space-y-6 mt-4">
              
              <div className="relative text-center">
                <BlurIn
                  word="DASHBOARD CRM"
                  duration={1.2}
                  variant={{
                    hidden: { filter: "blur(15px)", opacity: 0 },
                    visible: { filter: "blur(0px)", opacity: 1 }
                  }}
                  className={cn(
                    getSFProTextClasses('h1', 'accent'),
                    "text-transparent bg-clip-text bg-gradient-to-r from-[#FF2400] via-[#FFDA04] to-[#FF2400] drop-shadow-lg"
                  )}
                  style={{
                    textShadow: '0 2px 4px rgba(0,0,0,0.3), 0 0 20px rgba(255, 218, 4, 0.2)'
                  }}
                />
                
                {/* Sublinhado elegante com 4 camadas */}
                <div className="w-full h-2 relative mt-2">
                  <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FF2400]/80 to-transparent h-[2px] w-full blur-sm" />
                  <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FF2400] to-transparent h-px w-full" />
                  <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FFDA04]/80 to-transparent h-[3px] w-3/4 blur-sm mx-auto" />
                  <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FFDA04] to-transparent h-px w-3/4 mx-auto" />
                </div>
              </div>

              <div className="text-xs text-gray-400 text-center">
                ↑ Título com animação de desfoque + sublinhado em 4 camadas de gradiente
              </div>
            </div>
            
            {showCode && (
              <code className="text-xs text-gray-400 block mt-4 p-3 bg-gray-900/60 rounded">
{`// BlurIn Header com gradientes multi-camadas
<BlurIn
  word="DASHBOARD CRM"
  duration={1.2}
  variant={{
    hidden: { filter: "blur(15px)", opacity: 0 },
    visible: { filter: "blur(0px)", opacity: 1 }
  }}
  className={cn(
    getSFProTextClasses('h1', 'accent'),
    "text-transparent bg-clip-text bg-gradient-to-r from-[#FF2400] via-[#FFDA04] to-[#FF2400] drop-shadow-lg"
  )}
  style={{
    textShadow: '0 2px 4px rgba(0,0,0,0.3), 0 0 20px rgba(255, 218, 4, 0.2)'
  }}
/>

{/* Sublinhado em 4 camadas */}
<div className="w-full h-2 relative mt-2">
  <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FF2400]/80 to-transparent h-[2px] w-full blur-sm" />
  <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FF2400] to-transparent h-px w-full" />
  <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FFDA04]/80 to-transparent h-[3px] w-3/4 blur-sm mx-auto" />
  <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FFDA04] to-transparent h-px w-3/4 mx-auto" />
</div>`}
              </code>
            )}
          </div>

          {/* Period Selector com Mouse Tracking */}
          <div>
            <h4 className={getSFProTextClasses('h4', 'accent')}>Period Selector (Seletor de Período Interativo)</h4>
            <div className="space-y-4 mt-4">
              
              <div 
                className="relative flex items-center gap-2 h-10 px-3 py-2 bg-black/80 rounded-lg border border-white/10 backdrop-blur-sm hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-400/30 transition-all duration-300 group w-fit"
                onMouseMove={(e) => {
                  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                  const x = ((e.clientX - rect.left) / rect.width) * 100;
                  const y = ((e.clientY - rect.top) / rect.height) * 100;
                  (e.currentTarget as HTMLElement).style.setProperty("--x", `${x}%`);
                  (e.currentTarget as HTMLElement).style.setProperty("--y", `${y}%`);
                }}
              >
                <span className="text-sm text-white/70 font-medium">Período:</span>
                {[7, 30, 90, 180].map((days) => (
                  <Button
                    key={days}
                    variant={selectedPeriod === days ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedPeriod(days)}
                    className={`${
                      selectedPeriod === days 
                        ? "bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black font-bold shadow-lg shadow-[#FFD700]/30 scale-105 border-0" 
                        : "border-white/30 text-white hover:bg-white/20 hover:border-white/50 hover:scale-105 hover:shadow-md"
                    } backdrop-blur-sm transition-all duration-300 relative overflow-hidden group`}
                  >
                    <span className="relative z-10">{days}d</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-x-full group-hover:translate-x-full transform" />
                  </Button>
                ))}
                {/* Purple glow effect baseado na posição do mouse */}
                <div 
                  className="absolute inset-0 rounded-lg bg-gradient-to-br from-purple-500/20 via-transparent to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: `radial-gradient(600px circle at var(--x, 50%) var(--y, 50%), rgba(147, 51, 234, 0.15), transparent 40%)`
                  }}
                />
              </div>

              <div className="text-xs text-gray-400">
                ↑ Mova o mouse sobre o controle para ver o efeito de glow dinâmico
              </div>
            </div>
            
            {showCode && (
              <code className="text-xs text-gray-400 block mt-4 p-3 bg-gray-900/60 rounded">
{`// Period Selector com mouse tracking e purple glow
<div 
  className="relative flex items-center gap-2 h-10 px-3 py-2 bg-black/80 rounded-lg border border-white/10 backdrop-blur-sm hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-400/30 transition-all duration-300 group"
  onMouseMove={(e) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    (e.currentTarget as HTMLElement).style.setProperty("--x", \`\${x}%\`);
    (e.currentTarget as HTMLElement).style.setProperty("--y", \`\${y}%\`);
  }}
>
  <span className="text-sm text-white/70 font-medium">Período:</span>
  {[7, 30, 90, 180].map((days) => (
    <Button
      key={days}
      variant={selectedPeriod === days ? "default" : "outline"}
      size="sm"
      onClick={() => setSelectedPeriod(days)}
      className={\`\${
        selectedPeriod === days 
          ? "bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black font-bold shadow-lg shadow-[#FFD700]/30 scale-105 border-0" 
          : "border-white/30 text-white hover:bg-white/20 hover:border-white/50 hover:scale-105 hover:shadow-md"
      } backdrop-blur-sm transition-all duration-300 relative overflow-hidden group\`}
    >
      <span className="relative z-10">{days}d</span>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-x-full group-hover:translate-x-full transform" />
    </Button>
  ))}
  
  {/* Purple glow effect dinâmico */}
  <div 
    className="absolute inset-0 rounded-lg bg-gradient-to-br from-purple-500/20 via-transparent to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
    style={{
      background: \`radial-gradient(600px circle at var(--x, 50%) var(--y, 50%), rgba(147, 51, 234, 0.15), transparent 40%)\`
    }}
  />
</div>`}
              </code>
            )}
          </div>

          {/* Export Dropdown Animado */}
          <div>
            <h4 className={getSFProTextClasses('h4', 'accent')}>Export Dropdown (Dropdown de Exportação Animado)</h4>
            <div className="space-y-4 mt-4">
              
              <Button 
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsExporting(!isExporting);
                  setTimeout(() => setIsExporting(false), 2000);
                }}
                className="h-10 bg-black/80 border-[#FFD700]/40 text-[#FFD700] hover:bg-[#FFD700]/20 hover:shadow-xl hover:shadow-[#FFD700]/30 hover:border-[#FFD700]/80 hover:scale-105 backdrop-blur-sm transition-all duration-300 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#FFD700]/5 via-[#FFD700]/10 to-[#FFD700]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Download className={cn(
                  "h-4 w-4 mr-2 relative z-10 transition-transform duration-300",
                  isExporting && "animate-bounce"
                )} />
                <span className="relative z-10 font-medium">
                  {isExporting ? "Exportando..." : "Exportar Dados"}
                </span>
                <ChevronDown className={cn(
                  "h-4 w-4 ml-2 relative z-10 transition-transform duration-300",
                  isExporting && "rotate-180"
                )} />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-x-full group-hover:translate-x-full transform" />
              </Button>

              <div className="text-xs text-gray-400">
                ↑ Clique para ver as animações de download e rotação do chevron
              </div>
            </div>
            
            {showCode && (
              <code className="text-xs text-gray-400 block mt-4 p-3 bg-gray-900/60 rounded">
{`// Export Button com animações complexas
<Button 
  variant="outline"
  size="sm"
  onClick={() => setIsExporting(!isExporting)}
  className="h-10 bg-black/80 border-[#FFD700]/40 text-[#FFD700] hover:bg-[#FFD700]/20 hover:shadow-xl hover:shadow-[#FFD700]/30 hover:border-[#FFD700]/80 hover:scale-105 backdrop-blur-sm transition-all duration-300 relative overflow-hidden group"
>
  {/* Gradiente de fundo */}
  <div className="absolute inset-0 bg-gradient-to-r from-[#FFD700]/5 via-[#FFD700]/10 to-[#FFD700]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
  
  {/* Ícone animado */}
  <Download className={cn(
    "h-4 w-4 mr-2 relative z-10 transition-transform duration-300",
    isExporting && "animate-bounce"
  )} />
  
  {/* Texto dinâmico */}
  <span className="relative z-10 font-medium">
    {isExporting ? "Exportando..." : "Exportar Dados"}
  </span>
  
  {/* Chevron rotativo */}
  <ChevronDown className={cn(
    "h-4 w-4 ml-2 relative z-10 transition-transform duration-300",
    isExporting && "rotate-180"
  )} />
  
  {/* Shimmer effect */}
  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-x-full group-hover:translate-x-full transform" />
</Button>`}
              </code>
            )}
          </div>

          {/* Tab System Customizado */}
          <div>
            <h4 className={getSFProTextClasses('h4', 'accent')}>Custom Tab System (Sistema de Tabs Customizado)</h4>
            <div className="space-y-4 mt-4">
              
              <div className="grid w-full grid-cols-4 bg-black/40 border border-white/20 backdrop-blur-sm rounded-xl p-1">
                {[
                  { id: 'overview', label: 'Visão Geral' },
                  { id: 'segments', label: 'Segmentação' },
                  { id: 'calendar', label: 'Calendário' },
                  { id: 'maps', label: 'Mapas & IA' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative overflow-hidden",
                      activeTab === tab.id 
                        ? "bg-[#FFD700] text-black shadow-lg shadow-[#FFD700]/30 scale-105" 
                        : "text-white hover:bg-white/10 hover:scale-102"
                    )}
                  >
                    <span className="relative z-10">{tab.label}</span>
                    {activeTab !== tab.id && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                    )}
                  </button>
                ))}
              </div>

              <div className="text-xs text-gray-400">
                ↑ Sistema de 4 tabs com estilo dourado para tab ativa e efeitos hover
              </div>
            </div>
            
            {showCode && (
              <code className="text-xs text-gray-400 block mt-4 p-3 bg-gray-900/60 rounded">
{`// Tab System com gradientes dourados
<div className="grid w-full grid-cols-4 bg-black/40 border border-white/20 backdrop-blur-sm rounded-xl p-1">
  {tabs.map((tab) => (
    <button
      key={tab.id}
      onClick={() => setActiveTab(tab.id)}
      className={cn(
        "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative overflow-hidden",
        activeTab === tab.id 
          ? "bg-[#FFD700] text-black shadow-lg shadow-[#FFD700]/30 scale-105" 
          : "text-white hover:bg-white/10 hover:scale-102"
      )}
    >
      <span className="relative z-10">{tab.label}</span>
      {activeTab !== tab.id && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
      )}
    </button>
  ))}
</div>`}
              </code>
            )}
          </div>

          {/* Birthday Calendar System */}
          <div>
            <h4 className={getSFProTextClasses('h4', 'accent')}>Birthday Calendar System (Sistema de Calendário de Aniversários)</h4>
            <div className="space-y-4 mt-4">
              
              <Card className="bg-gray-800/30 border-gray-700/40">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Calendar className="h-5 w-5 text-primary-yellow" />
                    Próximos Aniversários
                    <Badge 
                      variant="outline" 
                      className="ml-auto bg-gradient-to-r from-yellow-500/30 to-orange-500/25 border-yellow-400/70 text-yellow-200 shadow-lg shadow-yellow-400/30 animate-bounce font-bold px-3 py-1.5"
                    >
                      🎉 {mockBirthdayCustomers.length} próximos ✨
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mockBirthdayCustomers.map(customer => (
                    <div
                      key={customer.id}
                      className={cn(
                        "p-4 rounded-lg border transition-all cursor-pointer hover:scale-[1.02]",
                        getBirthdayColor(customer)
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            {getBirthdayIcon(customer)}
                            {customer.isToday && (
                              <MessageSquare className="absolute -top-2 -right-2 h-3 w-3 text-yellow-300 animate-spin" />
                            )}
                          </div>
                          <div>
                            <p className={cn(
                              "font-medium",
                              customer.isToday && "text-yellow-200 font-bold"
                            )}>
                              {customer.name}
                              {customer.isToday && " 🎊"}
                            </p>
                            <p className="text-xs opacity-80">
                              Cliente especial
                            </p>
                          </div>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "border-current font-bold text-sm px-3 py-1.5 transition-all duration-300",
                            customer.isToday && "animate-pulse bg-gradient-to-r from-yellow-400/20 to-orange-400/20 border-yellow-400/70 shadow-lg shadow-yellow-400/30 scale-105",
                            customer.daysUntil === 1 && "bg-gradient-to-r from-orange-400/15 to-red-400/15 border-orange-400/60 shadow-md shadow-orange-400/20",
                            customer.daysUntil <= 7 && customer.daysUntil > 1 && "bg-gradient-to-r from-purple-400/10 to-pink-400/10 border-purple-400/50 shadow-md shadow-purple-400/15",
                            "hover:scale-110 hover:shadow-lg backdrop-blur-sm"
                          )}
                        >
                          {formatDaysUntil(customer)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="text-xs text-gray-400">
                ↑ Sistema completo com ícones dinâmicos, cores progressivas e badges animados
              </div>
            </div>
            
            {showCode && (
              <code className="text-xs text-gray-400 block mt-4 p-3 bg-gray-900/60 rounded">
{`// Birthday Calendar com cores e ícones dinâmicos
const getBirthdayIcon = (customer: any) => {
  if (customer.isToday) return (
    <div className="relative">
      <Cake className="h-5 w-5 text-yellow-400 animate-bounce drop-shadow-lg" />
      <div className="absolute -top-1 -right-1 h-2 w-2 bg-yellow-400 rounded-full animate-ping"></div>
    </div>
  );
  if (customer.daysUntil === 1) return <Gift className="h-5 w-5 text-orange-400 drop-shadow-md" />;
  if (customer.daysUntil <= 7) return <Gift className="h-4 w-4 text-purple-400 drop-shadow-sm hover:scale-110 transition-transform" />;
  return <Calendar className="h-4 w-4 text-blue-400 drop-shadow-sm" />;
};

const getBirthdayColor = (customer: any) => {
  if (customer.isToday) return 'bg-gradient-to-r from-yellow-500/30 via-orange-500/25 to-yellow-500/30 border-yellow-400/60 text-yellow-100 shadow-lg shadow-yellow-500/20';
  if (customer.daysUntil <= 7) return 'bg-gradient-to-r from-orange-500/25 via-red-500/20 to-orange-500/25 border-orange-400/50 text-orange-100 shadow-md shadow-orange-500/15';
  return 'bg-gradient-to-r from-blue-500/20 via-cyan-500/15 to-blue-500/20 border-blue-400/40 text-blue-100 shadow-md shadow-blue-500/10';
};

<div className={cn("p-4 rounded-lg border transition-all cursor-pointer hover:scale-[1.02]", getBirthdayColor(customer))}>
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="relative">
        {getBirthdayIcon(customer)}
        {customer.isToday && (
          <Sparkles className="absolute -top-2 -right-2 h-3 w-3 text-yellow-300 animate-spin" />
        )}
      </div>
      <div>
        <p className={cn("font-medium", customer.isToday && "text-yellow-200 font-bold")}>
          {customer.name}{customer.isToday && " 🎊"}
        </p>
      </div>
    </div>
    <Badge className={cn("border-current font-bold", customer.isToday && "animate-pulse scale-105")}>
      {formatDaysUntil(customer)}
    </Badge>
  </div>
</div>`}
              </code>
            )}
          </div>

          {/* Maintenance Placeholder */}
          <div>
            <h4 className={getSFProTextClasses('h4', 'accent')}>Maintenance Placeholder (Componente de Manutenção)</h4>
            <div className="space-y-4 mt-4">
              
              <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm shadow-lg hover:shadow-2xl hover:shadow-yellow-500/10 hover:border-yellow-400/30 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-sm text-white font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-yellow-400" />
                    Mapas de Distribuição
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-8 relative overflow-hidden group">
                  {/* Background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-orange-500/5"></div>
                  
                  <div className="relative z-10 text-center">
                    <div className="relative mb-4">
                      <div className="absolute inset-0 bg-yellow-500/20 rounded-full blur-lg group-hover:blur-xl transition-all duration-300"></div>
                      <Settings className="h-16 w-16 text-yellow-400 relative z-10 animate-pulse group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <p className="text-sm text-white/70 text-center mb-3">Visualização geográfica em desenvolvimento</p>
                    <Badge variant="outline" className="border-yellow-400/30 text-yellow-400 bg-yellow-400/10">
                      🔧 Em Manutenção
                    </Badge>
                  </div>
                  
                  {/* Elementos decorativos */}
                  <div className="absolute top-4 left-4 w-2 h-2 bg-yellow-400/60 rounded-full animate-pulse"></div>
                  <div className="absolute bottom-6 right-8 w-1.5 h-1.5 bg-orange-400/60 rounded-full animate-pulse delay-700"></div>
                </CardContent>
              </Card>

              <div className="text-xs text-gray-400">
                ↑ Placeholder especializado com animações e elementos decorativos
              </div>
            </div>
            
            {showCode && (
              <code className="text-xs text-gray-400 block mt-4 p-3 bg-gray-900/60 rounded">
{`// Maintenance Placeholder Component
<Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm shadow-lg hover:shadow-2xl hover:shadow-yellow-500/10 hover:border-yellow-400/30 transition-all duration-300">
  <CardContent className="flex flex-col items-center justify-center py-8 relative overflow-hidden group">
    {/* Background gradient */}
    <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-orange-500/5"></div>
    
    <div className="relative z-10 text-center">
      <div className="relative mb-4">
        <div className="absolute inset-0 bg-yellow-500/20 rounded-full blur-lg group-hover:blur-xl transition-all duration-300"></div>
        <Settings className="h-16 w-16 text-yellow-400 relative z-10 animate-pulse group-hover:scale-110 transition-transform duration-300" />
      </div>
      <p className="text-sm text-white/70 text-center mb-3">Funcionalidade em desenvolvimento</p>
      <Badge variant="outline" className="border-yellow-400/30 text-yellow-400 bg-yellow-400/10">
        🔧 Em Manutenção
      </Badge>
    </div>
    
    {/* Elementos decorativos animados */}
    <div className="absolute top-4 left-4 w-2 h-2 bg-yellow-400/60 rounded-full animate-pulse"></div>
    <div className="absolute bottom-6 right-8 w-1.5 h-1.5 bg-orange-400/60 rounded-full animate-pulse delay-700"></div>
  </CardContent>
</Card>`}
              </code>
            )}
          </div>

        </CardContent>
      </Card>
    </div>
  );
}

// ================================================================================================
// DELIVERY SECTION - Sistema de Entregas e Logística
// ================================================================================================
function DeliverySection({ showCode }: { showCode: boolean }) {
  const [deliveryStatus, setDeliveryStatus] = useState('pending');
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const mockDeliveryData = {
    total: 42,
    pending: 8,
    inTransit: 12,
    delivered: 20,
    cancelled: 2,
    revenue: 3248.50,
    averageTicket: 77.34,
    deliveryFees: 324.80
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
      case 'preparing': return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
      case 'out_for_delivery': return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'delivered': return 'bg-green-500/20 text-green-300 border-green-500/40';
      case 'cancelled': return 'bg-red-500/20 text-red-300 border-red-500/40';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/40';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'preparing': return <Package className="h-4 w-4" />;
      case 'out_for_delivery': return <Truck className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const statusOptions = [
    { value: 'pending', label: 'Pendente', color: 'yellow' },
    { value: 'preparing', label: 'Preparando', color: 'orange' },
    { value: 'out_for_delivery', label: 'Em Trânsito', color: 'blue' },
    { value: 'delivered', label: 'Entregue', color: 'green' },
    { value: 'cancelled', label: 'Cancelado', color: 'red' }
  ];

  const mockTimelineEvents = [
    { id: 1, status: 'pending', time: '14:32', note: 'Pedido recebido', user: 'Sistema', isCurrent: false },
    { id: 2, status: 'preparing', time: '14:45', note: 'Iniciando preparação', user: 'João Silva', isCurrent: false },
    { id: 3, status: 'out_for_delivery', time: '15:20', note: 'Saiu para entrega', user: 'Carlos Delivery', isCurrent: true },
    { id: 4, status: 'delivered', time: '16:05', note: 'Entregue ao cliente', user: 'Carlos Delivery', isCurrent: false }
  ];

  return (
    <div className="space-y-8">
      <Card className={getGlassCardClasses('default')}>
        <CardHeader>
          <CardTitle className={getSFProTextClasses('h2', 'accent')}>
            🚚 Delivery & Logistics - Sistema de Entregas
          </CardTitle>
          <p className="text-gray-400">
            Sistema completo de gestão de entregas com timeline, KPIs financeiros, 
            workflow de status e tracking em tempo real.
          </p>
        </CardHeader>
        <CardContent className="space-y-8">

          {/* KPI Cards com Hover Tracking */}
          <div>
            <h4 className={getSFProTextClasses('h4', 'accent')}>KPI Status Cards (Cards de Status com Mouse Tracking)</h4>
            <div className="space-y-4 mt-4">
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { icon: Truck, label: 'Total', value: mockDeliveryData.total, color: 'blue' },
                  { icon: Clock, label: 'Pendentes', value: mockDeliveryData.pending, color: 'yellow' },
                  { icon: Truck, label: 'Em Trânsito', value: mockDeliveryData.inTransit, color: 'blue' },
                  { icon: CheckCircle, label: 'Entregues', value: mockDeliveryData.delivered, color: 'green' }
                ].map((stat, index) => (
                  <Card 
                    key={index}
                    className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm shadow-lg hover:shadow-2xl hover:border-orange-400/30 transition-all duration-300 group"
                    onMouseMove={(e) => {
                      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                      const x = ((e.clientX - rect.left) / rect.width) * 100;
                      const y = ((e.clientY - rect.top) / rect.height) * 100;
                      (e.currentTarget as HTMLElement).style.setProperty("--x", `${x}%`);
                      (e.currentTarget as HTMLElement).style.setProperty("--y", `${y}%`);
                    }}
                  >
                    <CardContent className="p-6 relative overflow-hidden">
                      <div className="flex items-center gap-3 relative z-10">
                        <stat.icon className={cn(
                          "h-8 w-8 transition-all duration-300",
                          stat.color === 'blue' && "text-blue-400",
                          stat.color === 'yellow' && "text-yellow-400",
                          stat.color === 'green' && "text-green-400"
                        )} />
                        <div>
                          <p className="text-sm text-gray-400">{stat.label}</p>
                          <div className="text-2xl font-bold text-white">
                            {stat.value}
                          </div>
                        </div>
                      </div>
                      
                      {/* Mouse tracking glow effect */}
                      <div 
                        className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                        style={{
                          background: `radial-gradient(400px circle at var(--x, 50%) var(--y, 50%), rgba(249, 115, 22, 0.15), transparent 40%)`
                        }}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="text-xs text-gray-400">
                ↑ Mova o mouse sobre os cards para ver o efeito de glow dinâmico laranja
              </div>
            </div>
            
            {showCode && (
              <code className="text-xs text-gray-400 block mt-4 p-3 bg-gray-900/60 rounded">
{`// KPI Cards com mouse tracking e orange glow
<Card 
  className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm shadow-lg hover:shadow-2xl hover:border-orange-400/30 transition-all duration-300 group"
  onMouseMove={(e) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    (e.currentTarget as HTMLElement).style.setProperty("--x", \`\${x}%\`);
    (e.currentTarget as HTMLElement).style.setProperty("--y", \`\${y}%\`);
  }}
>
  <CardContent className="p-6 relative overflow-hidden">
    <div className="flex items-center gap-3 relative z-10">
      <Truck className="h-8 w-8 text-blue-400 transition-all duration-300" />
      <div>
        <p className="text-sm text-gray-400">Total de Entregas</p>
        <div className="text-2xl font-bold text-white">42</div>
      </div>
    </div>
    
    {/* Mouse tracking glow effect */}
    <div 
      className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
      style={{
        background: \`radial-gradient(400px circle at var(--x, 50%) var(--y, 50%), rgba(249, 115, 22, 0.15), transparent 40%)\`
      }}
    />
  </CardContent>
</Card>`}
              </code>
            )}
          </div>

          {/* Status Workflow System */}
          <div>
            <h4 className={getSFProTextClasses('h4', 'accent')}>Status Workflow (Sistema de Workflow de Status)</h4>
            <div className="space-y-4 mt-4">
              
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-gray-300">Status Atual:</span>
                <select 
                  value={deliveryStatus} 
                  onChange={(e) => setDeliveryStatus(e.target.value)}
                  className="bg-black/40 border border-white/30 rounded px-3 py-1 text-white text-sm"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {statusOptions.map((status, index) => (
                  <div key={status.value} className="flex items-center gap-2">
                    <Badge className={cn("font-medium border", getStatusColor(status.value))}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(status.value)}
                        {status.label}
                      </div>
                    </Badge>
                    {index < statusOptions.length - 1 && (
                      <ArrowRight className="h-4 w-4 text-gray-500" />
                    )}
                  </div>
                ))}
              </div>

              <Button
                onClick={() => {
                  setIsUpdating(true);
                  setTimeout(() => setIsUpdating(false), 2000);
                }}
                disabled={isUpdating}
                className="bg-blue-600 hover:bg-blue-700 hover:scale-105 transition-all duration-300"
              >
                {isUpdating ? (
                  <>
                    <div className="h-3 w-3 mr-2 animate-spin rounded-full border border-white/30 border-t-white" />
                    Atualizando...
                  </>
                ) : (
                  <>
                    <ArrowRight className="h-3 w-3 mr-2" />
                    Avançar Status
                  </>
                )}
              </Button>

              <div className="text-xs text-gray-400">
                ↑ Sistema de workflow com transições automáticas entre status
              </div>
            </div>
            
            {showCode && (
              <code className="text-xs text-gray-400 block mt-4 p-3 bg-gray-900/60 rounded">
{`// Status Workflow System
const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
    case 'preparing': return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
    case 'out_for_delivery': return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    case 'delivered': return 'bg-green-500/20 text-green-300 border-green-500/40';
    case 'cancelled': return 'bg-red-500/20 text-red-300 border-red-500/40';
    default: return 'bg-gray-500/20 text-gray-300 border-gray-500/40';
  }
};

const getNextStatus = (currentStatus: string) => {
  switch (currentStatus) {
    case 'pending': return 'preparing';
    case 'preparing': return 'out_for_delivery';
    case 'out_for_delivery': return 'delivered';
    default: return null;
  }
};

<Badge className={cn("font-medium border", getStatusColor(status))}>
  <div className="flex items-center gap-1">
    {getStatusIcon(status)}
    {getStatusText(status)}
  </div>
</Badge>`}
              </code>
            )}
          </div>

          {/* Vertical Timeline */}
          <div>
            <h4 className={getSFProTextClasses('h4', 'accent')}>Vertical Timeline (Timeline Vertical de Tracking)</h4>
            <div className="space-y-4 mt-4">
              
              <Card className="bg-gray-800/30 border-gray-700/40">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-400" />
                    Timeline da Entrega
                    <Badge variant="outline" className="ml-auto text-xs">
                      {mockTimelineEvents.length} eventos
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    {/* Linha vertical da timeline */}
                    <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-600/50"></div>
                    
                    <div className="space-y-6">
                      {mockTimelineEvents.map((event, index) => (
                        <div key={event.id} className="relative flex gap-4">
                          {/* Ícone do status */}
                          <div className={cn(
                            "relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300",
                            getStatusColor(event.status)
                          )}>
                            {getStatusIcon(event.status)}
                          </div>

                          {/* Conteúdo do evento */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className={cn(
                                  "font-medium",
                                  event.isCurrent ? "text-white" : "text-gray-300"
                                )}>
                                  {event.note}
                                </h4>
                                
                                <div className="flex items-center gap-2 mt-1">
                                  <MessageSquare className="h-3 w-3 text-gray-500" />
                                  <span className="text-xs text-gray-500">
                                    Status atualizado
                                  </span>
                                </div>
                              </div>

                              <div className="text-right flex-shrink-0 ml-4">
                                <div className="text-sm text-gray-300">
                                  {event.time}
                                </div>
                                <div className="flex items-center gap-1 mt-1">
                                  <User className="h-3 w-3 text-gray-500" />
                                  <span className="text-xs text-gray-500">
                                    {event.user}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="text-xs text-gray-400">
                ↑ Timeline vertical com linha conectora e ícones de status dinâmicos
              </div>
            </div>
            
            {showCode && (
              <code className="text-xs text-gray-400 block mt-4 p-3 bg-gray-900/60 rounded">
{`// Vertical Timeline Component
<div className="relative">
  {/* Linha vertical da timeline */}
  <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-600/50"></div>
  
  <div className="space-y-6">
    {timelineEvents.map((event, index) => (
      <div key={event.id} className="relative flex gap-4">
        {/* Ícone do status */}
        <div className={cn(
          "relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300",
          getStatusColor(event.status)
        )}>
          {getStatusIcon(event.status)}
        </div>

        {/* Conteúdo do evento */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className={cn("font-medium", event.isCurrent ? "text-white" : "text-gray-300")}>
                {event.note}
              </h4>
              
              <div className="flex items-center gap-2 mt-1">
                <MessageSquare className="h-3 w-3 text-gray-500" />
                <span className="text-xs text-gray-500">Status atualizado</span>
              </div>
            </div>

            <div className="text-right flex-shrink-0 ml-4">
              <div className="text-sm text-gray-300">{event.time}</div>
              <div className="flex items-center gap-1 mt-1">
                <User className="h-3 w-3 text-gray-500" />
                <span className="text-xs text-gray-500">{event.user}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
</div>`}
              </code>
            )}
          </div>

          {/* Financial Metrics Grid */}
          <div>
            <h4 className={getSFProTextClasses('h4', 'accent')}>Financial Metrics Grid (Grid de Métricas Financeiras)</h4>
            <div className="space-y-4 mt-4">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm shadow-lg hover:shadow-2xl hover:shadow-green-500/10 hover:border-green-400/30 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-8 w-8 text-green-400 transition-all duration-300" />
                      <div>
                        <p className="text-sm text-gray-400">Receita Total</p>
                        <div className="text-2xl font-bold text-green-400">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(mockDeliveryData.revenue)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm shadow-lg hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-400/30 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-8 w-8 text-purple-400 transition-all duration-300" />
                      <div>
                        <p className="text-sm text-gray-400">Ticket Médio</p>
                        <div className="text-2xl font-bold text-purple-400">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(mockDeliveryData.averageTicket)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm shadow-lg hover:shadow-2xl hover:shadow-orange-500/10 hover:border-orange-400/30 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <Truck className="h-8 w-8 text-orange-400 transition-all duration-300" />
                      <div>
                        <p className="text-sm text-gray-400">Taxas de Entrega</p>
                        <div className="text-2xl font-bold text-orange-400">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(mockDeliveryData.deliveryFees)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="text-xs text-gray-400">
                ↑ Grid responsivo com formatação de moeda brasileira (BRL) e cores específicas por métrica
              </div>
            </div>
            
            {showCode && (
              <code className="text-xs text-gray-400 block mt-4 p-3 bg-gray-900/60 rounded">
{`// Financial Metrics com formatação BRL
const formatCurrency = (value: number) => 
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm shadow-lg hover:shadow-2xl hover:shadow-green-500/10 hover:border-green-400/30 transition-all duration-300">
    <CardContent className="p-6">
      <div className="flex items-center gap-3">
        <DollarSign className="h-8 w-8 text-green-400 transition-all duration-300" />
        <div>
          <p className="text-sm text-gray-400">Receita Total</p>
          <div className="text-2xl font-bold text-green-400">
            {formatCurrency(revenue)}
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
  
  <Card className="hover:shadow-purple-500/10 hover:border-purple-400/30">
    <CardContent className="p-6">
      <div className="flex items-center gap-3">
        <DollarSign className="h-8 w-8 text-purple-400" />
        <div>
          <p className="text-sm text-gray-400">Ticket Médio</p>
          <div className="text-2xl font-bold text-purple-400">
            {formatCurrency(averageTicket)}
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</div>`}
              </code>
            )}
          </div>

          {/* Advanced Filter System */}
          <div>
            <h4 className={getSFProTextClasses('h4', 'accent')}>Advanced Filter System (Sistema de Filtros Avançado)</h4>
            <div className="space-y-4 mt-4">
              
              <div className="flex items-center gap-4 p-4 bg-black/40 rounded-lg border border-white/20">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-300">Filtros:</span>
                </div>
                
                <select 
                  value={selectedFilter} 
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="bg-black/40 border border-white/30 rounded px-3 py-1 text-white text-sm"
                >
                  <option value="all">Todos os Status</option>
                  <option value="pending">Pendentes</option>
                  <option value="in_transit">Em Trânsito</option>
                  <option value="delivered">Entregues</option>
                </select>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                  className="bg-black/40 border-white/30 text-white hover:bg-white/10"
                >
                  {sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                  Ordenar
                </Button>
                
                <div className="ml-auto flex items-center gap-2 text-sm text-white/70">
                  <span>42 de 42 entregas</span>
                  {selectedFilter !== 'all' && (
                    <span className="text-orange-400">• Filtrado</span>
                  )}
                </div>
              </div>

              <div className="text-xs text-gray-400">
                ↑ Sistema completo com filtros, ordenação e contador dinâmico de resultados
              </div>
            </div>
            
            {showCode && (
              <code className="text-xs text-gray-400 block mt-4 p-3 bg-gray-900/60 rounded">
{`// Advanced Filter System
const [selectedFilter, setSelectedFilter] = useState('all');
const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

// Aplicar filtros e ordenação
const filteredData = useMemo(() => {
  let filtered = deliveries;
  
  // Filtro por status
  if (selectedFilter !== 'all') {
    filtered = filtered.filter(d => d.status === selectedFilter);
  }
  
  // Ordenação
  filtered = [...filtered].sort((a, b) => {
    const aValue = new Date(a.created_at).getTime();
    const bValue = new Date(b.created_at).getTime();
    return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
  });
  
  return filtered;
}, [deliveries, selectedFilter, sortDirection]);

<div className="flex items-center gap-4 p-4 bg-black/40 rounded-lg border border-white/20">
  <select value={selectedFilter} onChange={(e) => setSelectedFilter(e.target.value)}>
    <option value="all">Todos os Status</option>
    <option value="pending">Pendentes</option>
    <option value="in_transit">Em Trânsito</option>
    <option value="delivered">Entregues</option>
  </select>
  
  <Button onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}>
    {sortDirection === 'asc' ? <ArrowUp /> : <ArrowDown />}
    Ordenar
  </Button>
  
  <div className="ml-auto">
    <span>{filteredData.length} de {deliveries.length} entregas</span>
    {selectedFilter !== 'all' && <span className="text-orange-400">• Filtrado</span>}
  </div>
</div>`}
              </code>
            )}
          </div>

        </CardContent>
      </Card>
    </div>
  );
}

// ================================================================================================
// AUTOMATIONS SECTION - Sistema de Automações e Workflows
// ================================================================================================
function AutomationsSection({ showCode }: { showCode: boolean }) {
  const [activeTab, setActiveTab] = useState('workflows');

  const mockAutomationData = {
    activeWorkflows: 8,
    totalExecutions: 1247,
    successRate: 97.5,
    customersImpacted: 89,
    upcomingTasks: 12
  };

  const workflowSuggestions = [
    {
      id: 1,
      type: 'birthday',
      title: 'Campanhas de Aniversário Automatizadas',
      description: 'Enviar ofertas personalizadas para 45 clientes nos seus aniversários',
      status: 'ready',
      priority: 'high',
      estimatedImpact: 45,
      progress: 85
    },
    {
      id: 2,
      type: 'churn',
      title: 'Prevenção de Churn Inteligente',
      description: 'Reengajar 23 clientes inativos com ofertas personalizadas',
      status: 'development',
      priority: 'high',
      estimatedImpact: 23,
      progress: 45
    },
    {
      id: 3,
      type: 'stock',
      title: 'Alertas de Estoque Automatizados',
      description: 'Notificar sobre 8 produtos com estoque baixo',
      status: 'ready',
      priority: 'medium',
      estimatedImpact: 8,
      progress: 85
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'text-green-500 bg-green-500/10';
      case 'development': return 'text-yellow-500 bg-yellow-500/10';
      case 'planning': return 'text-blue-500 bg-blue-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/10';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10';
      case 'low': return 'text-blue-400 bg-blue-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. BlurIn Animated Header com Gradiente */}
      <Card className={getGlassCardClasses('premium')}>
        <CardHeader>
          <CardTitle className={getSFProTextClasses('h3', 'accent')}>
            🤖 BlurIn Header com Gradiente Animado
          </CardTitle>
          <p className={getSFProTextClasses('body', 'secondary')}>
            Header animado com efeitos de blur e gradiente customizado Adega
          </p>
        </CardHeader>
        <CardContent>
          {/* Header Preview */}
          <div className="relative text-center p-8 bg-black/20 border border-white/10 rounded-xl">
            <BlurIn
              word="AUTOMAÇÕES & INTEGRAÇÕES"
              duration={1.2}
              variant={{
                hidden: { filter: "blur(15px)", opacity: 0 },
                visible: { filter: "blur(0px)", opacity: 1 }
              }}
              className={cn(
                getSFProTextClasses('h1', 'accent'),
                "text-transparent bg-clip-text bg-gradient-to-r from-[#FF2400] via-[#FFDA04] to-[#FF2400] drop-shadow-lg"
              )}
              style={{
                textShadow: '0 2px 4px rgba(0,0,0,0.3), 0 0 20px rgba(255, 218, 4, 0.2)'
              }}
            />
            
            {/* Sublinhado Gradiente */}
            <div className="w-full h-2 relative mt-4">
              <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FF2400]/80 to-transparent h-[2px] w-full blur-sm" />
              <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FF2400] to-transparent h-px w-full" />
              <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FFDA04]/80 to-transparent h-[3px] w-3/4 blur-sm mx-auto" />
              <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FFDA04] to-transparent h-px w-3/4 mx-auto" />
            </div>
          </div>

          {showCode && (
            <code className="text-xs text-gray-400 block mt-4 p-3 bg-gray-900/60 rounded">
{`// BlurIn Header com Gradiente Customizado
<BlurIn
  word="AUTOMAÇÕES & INTEGRAÇÕES"
  duration={1.2}
  variant={{
    hidden: { filter: "blur(15px)", opacity: 0 },
    visible: { filter: "blur(0px)", opacity: 1 }
  }}
  className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF2400] via-[#FFDA04] to-[#FF2400]"
  style={{
    textShadow: '0 2px 4px rgba(0,0,0,0.3), 0 0 20px rgba(255, 218, 4, 0.2)'
  }}
/>`}
            </code>
          )}
        </CardContent>
      </Card>

      {/* 2. StatCard com Layout Automation */}
      <Card className={getGlassCardClasses('default')}>
        <CardHeader>
          <CardTitle className={getSFProTextClasses('h4', 'accent')}>
            📊 StatCards com Layout Automation
          </CardTitle>
          <p className={getSFProTextClasses('body', 'secondary')}>
            Cards especializados para métricas de automação com variants únicos
          </p>
        </CardHeader>
        <CardContent>
          {/* StatCards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              layout="automation"
              variant="purple"
              title="Workflows Sugeridos"
              value={mockAutomationData.activeWorkflows}
              description={`🤖 Baseado em ${mockAutomationData.customersImpacted} clientes`}
              icon={Bot}
            />

            <StatCard
              layout="automation"
              variant="default"
              title="Execuções Históricas"
              value={mockAutomationData.totalExecutions.toLocaleString()}
              description="⚡ Sistema ativo"
              icon={Zap}
            />

            <StatCard
              layout="automation"
              variant="success"
              title="Taxa de Sucesso"
              value={`${mockAutomationData.successRate}%`}
              description="✅ Excelente performance"
              icon={TrendingUp}
            />

            <StatCard
              layout="automation"
              variant="warning"
              title="Clientes Elegíveis"
              value={mockAutomationData.customersImpacted}
              description={`👥 ${mockAutomationData.upcomingTasks} tarefas pendentes`}
              icon={Users}
            />
          </div>

          {showCode && (
            <code className="text-xs text-gray-400 block mt-4 p-3 bg-gray-900/60 rounded">
{`// StatCard com Layout Automation
<StatCard
  layout="automation"
  variant="purple"
  title="Workflows Sugeridos"
  value={mockAutomationData.activeWorkflows}
  description="🤖 Baseado em dados reais"
  icon={Bot}
/>`}
            </code>
          )}
        </CardContent>
      </Card>

      {/* 3. Tabs com Gradientes e Animações */}
      <Card className={getGlassCardClasses('default')}>
        <CardHeader>
          <CardTitle className={getSFProTextClasses('h4', 'accent')}>
            🎨 Tabs com Gradientes Coloridos e Animações
          </CardTitle>
          <p className={getSFProTextClasses('body', 'secondary')}>
            Sistema de tabs com gradientes únicos por categoria e overlay animado
          </p>
        </CardHeader>
        <CardContent>
          {/* Tabs Preview */}
          <div className="grid w-full grid-cols-4 bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-1 shadow-lg">
            {[
              { id: 'workflows', label: 'Workflows', icon: Bot, gradient: 'from-purple-500/20 to-blue-500/20', text: 'text-purple-300', border: 'border-purple-400/30', shadow: 'shadow-purple-500/20' },
              { id: 'campaigns', label: 'Campanhas', icon: MessageSquare, gradient: 'from-orange-500/20 to-red-500/20', text: 'text-orange-300', border: 'border-orange-400/30', shadow: 'shadow-orange-500/20' },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp, gradient: 'from-green-500/20 to-emerald-500/20', text: 'text-green-300', border: 'border-green-400/30', shadow: 'shadow-green-500/20' },
              { id: 'integrations', label: 'Integrações', icon: Zap, gradient: 'from-yellow-500/20 to-amber-500/20', text: 'text-yellow-300', border: 'border-yellow-400/30', shadow: 'shadow-yellow-500/20' }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative ${isActive ? 
                    `bg-gradient-to-r ${tab.gradient} ${tab.text} border ${tab.border} shadow-lg ${tab.shadow}` : 
                    'text-gray-400 hover:text-white'
                  } transition-all duration-300 rounded-lg backdrop-blur-sm p-3 flex items-center justify-center gap-2`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{tab.label}</span>
                  {isActive && (
                    <div className={`absolute inset-0 bg-gradient-to-r ${tab.gradient} rounded-lg opacity-100 transition-opacity duration-300`} style={{ zIndex: -1 }} />
                  )}
                </button>
              );
            })}
          </div>

          {showCode && (
            <code className="text-xs text-gray-400 block mt-4 p-3 bg-gray-900/60 rounded">
{`// Tabs com Gradientes Customizados
<TabsTrigger 
  value="workflows" 
  className="relative data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-blue-500/20 data-[state=active]:text-purple-300 data-[state=active]:border data-[state=active]:border-purple-400/30 data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/20 text-gray-400 hover:text-white transition-all duration-300 rounded-lg backdrop-blur-sm"
>
  <Bot className="w-4 h-4 mr-2" />
  Workflows
  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg opacity-0 data-[state=active]:opacity-100 transition-opacity duration-300" />
</TabsTrigger>`}
            </code>
          )}
        </CardContent>
      </Card>

      {/* 4. Cards de Workflow Suggestions */}
      <Card className={getGlassCardClasses('default')}>
        <CardHeader>
          <CardTitle className={getSFProTextClasses('h4', 'accent')}>
            💡 Cards de Sugestões de Workflow
          </CardTitle>
          <p className={getSFProTextClasses('body', 'secondary')}>
            Cards interativos com badges de status e prioridade, dados de impacto
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {workflowSuggestions.map((workflow) => (
              <div key={workflow.id} className="p-4 bg-gray-700/30 rounded-lg border border-gray-600/30 hover:bg-gray-700/50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-white">{workflow.title}</h4>
                    <p className="text-sm text-gray-400 mt-1">{workflow.description}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Badge className={getStatusColor(workflow.status)}>
                      {workflow.status === 'ready' ? 'Pronto para Deploy' : 
                       workflow.status === 'development' ? 'Em Desenvolvimento' : 'Em Planejamento'}
                    </Badge>
                    <Badge className={`text-xs ${getPriorityColor(workflow.priority)}`}>
                      {workflow.priority === 'high' ? 'Alta' : 
                       workflow.priority === 'medium' ? 'Média' : 'Baixa'} prioridade
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Impacto Estimado</span>
                    <span className="text-emerald-400 font-medium">{workflow.estimatedImpact} clientes</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Status</span>
                    <span className="text-white font-medium">
                      {workflow.status === 'ready' ? 'Pronto para ativação' : 'Em análise'}
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-600/30">
                  <span className="text-xs text-gray-400">
                    🎯 Baseado em dados reais do sistema
                  </span>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" disabled className="h-6 px-2 text-amber-400 hover:text-amber-300">
                      <Settings className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {showCode && (
            <code className="text-xs text-gray-400 block mt-4 p-3 bg-gray-900/60 rounded">
{`// Card de Workflow com Badges Dinâmicos
<div className="p-4 bg-gray-700/30 rounded-lg border border-gray-600/30 hover:bg-gray-700/50 transition-colors">
  <div className="flex items-start justify-between mb-3">
    <div className="flex-1">
      <h4 className="font-medium text-white">{workflow.title}</h4>
      <p className="text-sm text-gray-400 mt-1">{workflow.description}</p>
    </div>
    <div className="flex flex-col gap-1">
      <Badge className={getStatusColor(workflow.status)}>
        Pronto para Deploy
      </Badge>
      <Badge className={getPriorityColor(workflow.priority)}>
        Alta prioridade
      </Badge>
    </div>
  </div>
</div>`}
            </code>
          )}
        </CardContent>
      </Card>

      {/* 5. Execution Status Items */}
      <Card className={getGlassCardClasses('default')}>
        <CardHeader>
          <CardTitle className={getSFProTextClasses('h4', 'accent')}>
            ⚡ Execution Status Items
          </CardTitle>
          <p className={getSFProTextClasses('body', 'secondary')}>
            Items com status dinâmicos e ícones de resultado das execuções
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { id: '1', name: 'Campanha Aniversário - Maria Santos', trigger: 'Data de nascimento', result: 'success', date: '09/01/2024' },
              { id: '2', name: 'Prevenção Churn - Carlos Oliveira', trigger: 'Inatividade 60+ dias', result: 'error', date: '09/01/2024' },
              { id: '3', name: 'Estoque Baixo - Vinho Tinto', trigger: 'Quantidade mínima', result: 'pending', date: '08/01/2024' }
            ].map((execution) => (
              <div key={execution.id} className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  execution.result === 'success' ? 'bg-green-500/20' :
                  execution.result === 'error' ? 'bg-red-500/20' :
                  'bg-yellow-500/20'
                }`}>
                  {execution.result === 'success' ? (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  ) : execution.result === 'error' ? (
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                  ) : (
                    <Clock className="h-4 w-4 text-yellow-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{execution.name}</p>
                  <p className="text-xs text-gray-400">{execution.trigger}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">{execution.date}</p>
                </div>
              </div>
            ))}
          </div>

          {showCode && (
            <code className="text-xs text-gray-400 block mt-4 p-3 bg-gray-900/60 rounded">
{`// Execution Status Item
<div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors">
  <div className={\`w-8 h-8 rounded-full flex items-center justify-center \${
    execution.result === 'success' ? 'bg-green-500/20' :
    execution.result === 'error' ? 'bg-red-500/20' :
    'bg-yellow-500/20'
  }\`}>
    {execution.result === 'success' ? (
      <CheckCircle className="h-4 w-4 text-green-400" />
    ) : execution.result === 'error' ? (
      <AlertTriangle className="h-4 w-4 text-red-400" />
    ) : (
      <Clock className="h-4 w-4 text-yellow-400" />
    )}
  </div>
  <div className="flex-1 min-w-0">
    <p className="text-sm font-medium text-white truncate">{execution.name}</p>
    <p className="text-xs text-gray-400">{execution.trigger}</p>
  </div>
</div>`}
            </code>
          )}
        </CardContent>
      </Card>

      {/* 6. Loading Counter Badge */}
      <Card className={getGlassCardClasses('default')}>
        <CardHeader>
          <CardTitle className={getSFProTextClasses('h4', 'accent')}>
            🔄 Loading Counter Badge
          </CardTitle>
          <p className={getSFProTextClasses('body', 'secondary')}>
            Badge com loading spinner e contador dinâmico para workflows
          </p>
        </CardHeader>
        <CardContent>
          {/* Counter Badge Preview */}
          <div className="flex justify-center">
            <div className="bg-black/50 backdrop-blur-sm border border-yellow-400/30 rounded-full px-4 py-2 shadow-lg">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin"></div>
                <span className="text-xs text-gray-300">carregando...</span>
              </div>
            </div>
          </div>

          {/* Normal State */}
          <div className="flex justify-center mt-4">
            <div className="bg-black/50 backdrop-blur-sm border border-yellow-400/30 rounded-full px-4 py-2 shadow-lg">
              <span className="text-sm font-bold text-gray-100">{mockAutomationData.activeWorkflows}</span>
              <span className="text-xs ml-1 opacity-75 text-gray-300">workflows sugeridos</span>
            </div>
          </div>

          {showCode && (
            <code className="text-xs text-gray-400 block mt-4 p-3 bg-gray-900/60 rounded">
{`// Loading Counter Badge
{isLoadingMetrics ? (
  <div className="flex items-center gap-2">
    <div className="w-4 h-4 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin"></div>
    <span className="text-xs text-gray-300">carregando...</span>
  </div>
) : (
  <>
    <span className="text-sm font-bold text-gray-100">{activeWorkflows}</span>
    <span className="text-xs ml-1 opacity-75 text-gray-300">workflows sugeridos</span>
  </>
)}`}
            </code>
          )}
        </CardContent>
      </Card>

      {/* 7. Mouse Tracking Container */}
      <Card className={getGlassCardClasses('default')}>
        <CardHeader>
          <CardTitle className={getSFProTextClasses('h4', 'accent')}>
            🎯 Mouse Tracking Container com Glow
          </CardTitle>
          <p className={getSFProTextClasses('body', 'secondary')}>
            Container que reage ao movimento do mouse com gradiente radial
          </p>
        </CardHeader>
        <CardContent>
          {/* Mouse Tracking Preview */}
          <div 
            className="relative h-48 bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg p-4 flex flex-col hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-400/30 transition-all duration-300 overflow-hidden cursor-pointer group"
            onMouseMove={(e) => {
              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
              const x = ((e.clientX - rect.left) / rect.width) * 100;
              const y = ((e.clientY - rect.top) / rect.height) * 100;
              (e.currentTarget as HTMLElement).style.setProperty("--x", `${x}%`);
              (e.currentTarget as HTMLElement).style.setProperty("--y", `${y}%`);
            }}
          >
            <div 
              className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500/20 via-transparent to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{
                background: `radial-gradient(300px circle at var(--x, 50%) var(--y, 50%), rgba(147, 51, 234, 0.15), transparent 40%)`
              }}
            />
            
            <div className="relative z-10 h-full flex items-center justify-center">
              <div className="text-center">
                <Bot className="h-12 w-12 text-purple-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-white mb-2">Container de Automação</h3>
                <p className="text-gray-400 text-sm">Mova o mouse para ver o efeito de glow roxo</p>
              </div>
            </div>
          </div>

          {showCode && (
            <code className="text-xs text-gray-400 block mt-4 p-3 bg-gray-900/60 rounded">
{`// Mouse Tracking Container
<div 
  className="relative overflow-hidden group"
  onMouseMove={(e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    e.currentTarget.style.setProperty("--x", \`\${x}%\`);
    e.currentTarget.style.setProperty("--y", \`\${y}%\`);
  }}
>
  <div 
    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
    style={{
      background: \`radial-gradient(300px circle at var(--x, 50%) var(--y, 50%), rgba(147, 51, 234, 0.15), transparent 40%)\`
    }}
  />
</div>`}
            </code>
          )}
        </CardContent>
      </Card>

      {/* 8. Loading States para Cards */}
      <Card className={getGlassCardClasses('default')}>
        <CardHeader>
          <CardTitle className={getSFProTextClasses('h4', 'accent')}>
            ⏳ Loading States para Cards de Automação
          </CardTitle>
          <p className={getSFProTextClasses('body', 'secondary')}>
            Estados de loading com skeleton e animações para cards e listas
          </p>
        </CardHeader>
        <CardContent>
          {/* Loading States Preview */}
          <div className="space-y-4">
            {/* Workflow Card Loading */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-400">Loading para Cards de Workflow:</h4>
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="p-4 bg-gray-700/30 rounded-lg border border-gray-600/30 animate-pulse">
                  <div className="h-4 bg-white/10 rounded mb-2" />
                  <div className="h-3 bg-white/5 rounded w-2/3 mb-3" />
                  <div className="h-2 bg-white/10 rounded" />
                </div>
              ))}
            </div>

            {/* Execution Items Loading */}
            <div className="space-y-3 mt-6">
              <h4 className="text-sm font-medium text-gray-400">Loading para Execuções:</h4>
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg animate-pulse">
                  <div className="w-8 h-8 bg-white/10 rounded-full" />
                  <div className="flex-1">
                    <div className="h-3 bg-white/10 rounded mb-1" />
                    <div className="h-2 bg-white/5 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {showCode && (
            <code className="text-xs text-gray-400 block mt-4 p-3 bg-gray-900/60 rounded">
{`// Loading States para Cards
{isLoadingSuggestions ? (
  <div className="space-y-3">
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="p-4 bg-gray-700/30 rounded-lg border border-gray-600/30 animate-pulse">
        <div className="h-4 bg-white/10 rounded mb-2" />
        <div className="h-3 bg-white/5 rounded w-2/3 mb-3" />
        <div className="h-2 bg-white/10 rounded" />
      </div>
    ))}
  </div>
) : (
  // Conteúdo real
)}`}
            </code>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


// ================================================================================================
// REPORTS SECTION - Sistema de Relatórios e Analytics
// ================================================================================================
function ReportsSection({ showCode }: { showCode: boolean }) {
  const [selectedPeriod, setSelectedPeriod] = useState(30);
  const [activeTab, setActiveTab] = useState('sales');
  const [activeFilter, setActiveFilter] = useState('all');

  const mockReportData = {
    totalRevenue: 87450.50,
    totalSales: 234,
    averageTicket: 373.93,
    grossProfit: 52470.30,
    grossMargin: 60.0,
    operationalProfit: 32180.25,
    operationalMargin: 36.8,
    netProfit: 23526.18,
    netMargin: 26.9
  };

  const mockDREData = {
    receita_bruta: 100000,
    deducoes_receita: 12550,
    receita_liquida: 87450,
    cogs: 35000,
    lucro_bruto: 52450,
    margem_bruta_percent: 60.0,
    despesas_operacionais: 20270,
    resultado_operacional: 32180,
    margem_operacional_percent: 36.8,
    impostos: 8654,
    lucro_liquido: 23526,
    margem_liquida_percent: 26.9
  };

  const mockCategoryData = [
    { category: 'Bebidas', revenue: 45230, percent: 51.7 },
    { category: 'Vinhos', revenue: 23450, percent: 26.8 },
    { category: 'Destilados', revenue: 12340, percent: 14.1 },
    { category: 'Acessórios', revenue: 6430, percent: 7.4 }
  ];

  const mockTableData = [
    {
      id: '1',
      customer_name: 'João Silva',
      amount: 1250.00,
      due_date: '2024-01-15',
      days_overdue: 25,
      payment_method: 'Cartão',
      status: 'overdue'
    },
    {
      id: '2', 
      customer_name: 'Maria Santos',
      amount: 890.50,
      due_date: '2024-01-20',
      days_overdue: 0,
      payment_method: 'PIX',
      status: 'current'
    },
    {
      id: '3',
      customer_name: 'Carlos Oliveira',
      amount: 2100.75,
      due_date: '2024-01-10',
      days_overdue: 35,
      payment_method: 'Dinheiro',
      status: 'overdue'
    }
  ];

  const periodOptions = [
    { value: 30, label: 'Últimos 30 dias' },
    { value: 90, label: 'Últimos 3 meses' },
    { value: 365, label: 'Último ano' }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getOverdueStatus = (daysOverdue: number) => {
    if (daysOverdue === 0) return { label: 'Em dia', color: 'text-green-400' };
    if (daysOverdue <= 30) return { label: `${daysOverdue}d atraso`, color: 'text-yellow-400' };
    return { label: `${daysOverdue}d atraso`, color: 'text-red-400' };
  };

  const DRELine = ({ 
    label, 
    value, 
    percentage, 
    isTotal = false, 
    isSubtotal = false,
    isNegative = false,
    level = 0 
  }: {
    label: string;
    value: number;
    percentage?: number;
    isTotal?: boolean;
    isSubtotal?: boolean;
    isNegative?: boolean;
    level?: number;
  }) => {
    const indentClass = level > 0 ? `ml-${level * 4}` : '';
    
    return (
      <div className={cn(
        "flex items-center justify-between py-2 px-4",
        isTotal && "border-t border-b border-white/20 bg-white/5 font-bold text-lg",
        isSubtotal && "border-t border-white/10 bg-white/3 font-semibold",
        !isTotal && !isSubtotal && "text-gray-200",
        indentClass
      )}>
        <span className={cn(
          isTotal && "text-white",
          isSubtotal && "text-gray-100",
          isNegative && "text-red-300"
        )}>
          {label}
        </span>
        <div className="flex items-center gap-3">
          <span className={cn(
            "font-mono",
            isTotal && "text-white font-bold",
            isSubtotal && "text-gray-100 font-semibold",
            isNegative ? "text-red-300" : "text-green-300"
          )}>
            {isNegative ? `-${formatCurrency(Math.abs(value))}` : formatCurrency(value)}
          </span>
          {percentage !== undefined && (
            <span className={cn(
              "text-xs w-16 text-right",
              percentage > 0 ? "text-green-400" : "text-red-400"
            )}>
              {formatPercent(percentage)}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. Period Selector Buttons */}
      <Card className={getGlassCardClasses('premium')}>
        <CardHeader>
          <CardTitle className={getSFProTextClasses('h3', 'accent')}>
            📅 Period Selector com Buttons
          </CardTitle>
          <p className={getSFProTextClasses('body', 'secondary')}>
            Seletor de período com botões estilizados para relatórios
          </p>
        </CardHeader>
        <CardContent>
          {/* Period Selector Preview */}
          <div className="flex bg-white/5 rounded-lg p-1">
            {periodOptions.map((option) => (
              <Button
                key={option.value}
                variant={selectedPeriod === option.value ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedPeriod(option.value)}
                className={cn(
                  "text-xs h-7",
                  selectedPeriod === option.value 
                    ? "bg-blue-500 text-white hover:bg-blue-600 font-semibold" 
                    : "hover:text-white hover:bg-white/15 font-medium text-gray-300"
                )}
              >
                {option.label}
              </Button>
            ))}
          </div>

          {showCode && (
            <code className="text-xs text-gray-400 block mt-4 p-3 bg-gray-900/60 rounded">
{`// Period Selector com Buttons Estilizados
<div className="flex bg-white/5 rounded-lg p-1">
  {periodOptions.map((option) => (
    <Button
      key={option.value}
      variant={selectedPeriod === option.value ? "default" : "ghost"}
      size="sm"
      onClick={() => setSelectedPeriod(option.value)}
      className={cn(
        "text-xs h-7",
        selectedPeriod === option.value 
          ? "bg-blue-500 text-white hover:bg-blue-600 font-semibold" 
          : "hover:text-white hover:bg-white/15 font-medium text-gray-300"
      )}
    >
      {option.label}
    </Button>
  ))}
</div>`}
            </code>
          )}
        </CardContent>
      </Card>

      {/* 2. Financial KPI Cards com Hover Effects */}
      <Card className={getGlassCardClasses('default')}>
        <CardHeader>
          <CardTitle className={getSFProTextClasses('h4', 'accent')}>
            📊 Financial KPI Cards com Hover Effects
          </CardTitle>
          <p className={getSFProTextClasses('body', 'secondary')}>
            Cards financeiros com efeitos hover e gradientes específicos
          </p>
        </CardHeader>
        <CardContent>
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-400/30 hover:bg-gray-700/40">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-blue-400 transition-all duration-300" />
                  <div>
                    <p className="text-sm text-gray-400">Receita Total</p>
                    <div className="text-2xl font-bold text-white">
                      {formatCurrency(mockReportData.totalRevenue)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/10 hover:border-green-400/30 hover:bg-gray-700/40">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Package className="h-8 w-8 text-green-400 transition-all duration-300" />
                  <div>
                    <p className="text-sm text-gray-400">Total de Vendas</p>
                    <div className="text-2xl font-bold text-white">
                      {mockReportData.totalSales}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-400/30 hover:bg-gray-700/40">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-8 w-8 text-purple-400 transition-all duration-300" />
                  <div>
                    <p className="text-sm text-gray-400">Ticket Médio</p>
                    <div className="text-2xl font-bold text-white">
                      {formatCurrency(mockReportData.averageTicket)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {showCode && (
            <code className="text-xs text-gray-400 block mt-4 p-3 bg-gray-900/60 rounded">
{`// Financial KPI Card com Hover Effects
<Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-400/30 hover:bg-gray-700/40">
  <CardContent className="p-4">
    <div className="flex items-center gap-3">
      <TrendingUp className="h-8 w-8 text-blue-400 transition-all duration-300" />
      <div>
        <p className="text-sm text-gray-400">Receita Total</p>
        <div className="text-2xl font-bold text-white">
          {formatCurrency(value)}
        </div>
      </div>
    </div>
  </CardContent>
</Card>`}
            </code>
          )}
        </CardContent>
      </Card>

      {/* 3. DRE Line Component */}
      <Card className={getGlassCardClasses('default')}>
        <CardHeader>
          <CardTitle className={getSFProTextClasses('h4', 'accent')}>
            📋 DRE Line Component
          </CardTitle>
          <p className={getSFProTextClasses('body', 'secondary')}>
            Componente especializado para linhas de DRE com formatação condicional
          </p>
        </CardHeader>
        <CardContent>
          {/* DRE Lines Preview */}
          <div className="space-y-1 bg-black/20 border border-white/10 rounded-lg">
            <DRELine label="Receita Bruta de Vendas" value={mockDREData.receita_bruta} percentage={100} />
            <DRELine label="(-) Deduções da Receita" value={mockDREData.deducoes_receita} isNegative level={1} />
            <DRELine 
              label="Receita Líquida de Vendas" 
              value={mockDREData.receita_liquida} 
              percentage={100}
              isSubtotal 
            />
            <DRELine 
              label="(-) Custo dos Produtos Vendidos" 
              value={mockDREData.cogs} 
              percentage={(mockDREData.cogs / mockDREData.receita_liquida) * 100}
              isNegative 
              level={1} 
            />
            <DRELine 
              label="LUCRO LÍQUIDO DO PERÍODO" 
              value={mockDREData.lucro_liquido} 
              percentage={mockDREData.margem_liquida_percent}
              isTotal 
            />
          </div>

          {showCode && (
            <code className="text-xs text-gray-400 block mt-4 p-3 bg-gray-900/60 rounded">
{`// DRE Line Component
const DRELine = ({ label, value, percentage, isTotal, isSubtotal, isNegative, level }) => {
  const indentClass = level > 0 ? \`ml-\${level * 4}\` : '';
  
  return (
    <div className={cn(
      "flex items-center justify-between py-2 px-4",
      isTotal && "border-t border-b border-white/20 bg-white/5 font-bold text-lg",
      isSubtotal && "border-t border-white/10 bg-white/3 font-semibold",
      !isTotal && !isSubtotal && "text-gray-200",
      indentClass
    )}>
      <span className={cn(
        isTotal && "text-white",
        isSubtotal && "text-gray-100",
        isNegative && "text-red-300"
      )}>
        {label}
      </span>
      <div className="flex items-center gap-3">
        <span className={cn("font-mono", isNegative ? "text-red-300" : "text-green-300")}>
          {formatCurrency(value)}
        </span>
      </div>
    </div>
  );
};`}
            </code>
          )}
        </CardContent>
      </Card>

      {/* 4. Advanced Data Table com Search e Filtros */}
      <Card className={getGlassCardClasses('default')}>
        <CardHeader>
          <CardTitle className={getSFProTextClasses('h4', 'accent')}>
            📊 Advanced Data Table com Search
          </CardTitle>
          <p className={getSFProTextClasses('body', 'secondary')}>
            Tabela avançada com busca, ordenação e controles de coluna
          </p>
        </CardHeader>
        <CardContent>
          {/* Table Preview */}
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex items-center gap-4">
              <div className="w-full sm:w-80">
                <SearchInput 
                  placeholder="Buscar contas a receber..." 
                  className="w-full"
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>3 de 3 registros</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="bg-black/50 border-white/20 text-white hover:bg-white/10">
                      Colunas
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-black/90 border-white/10">
                    <DropdownMenuCheckboxItem checked className="text-white hover:bg-white/10">
                      Cliente
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked className="text-white hover:bg-white/10">
                      Valor
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked className="text-white hover:bg-white/10">
                      Status
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Table */}
            <div className="bg-black/40 rounded-lg border border-white/10 overflow-hidden h-64">
              <div className="h-full max-h-full overflow-auto">
                <table className="w-full border-collapse min-w-full">
                  <thead className="sticky top-0 z-10">
                    <tr className="border-b border-white/10 bg-black/60 backdrop-blur-sm">
                      <th className="w-[250px] text-left p-3 text-gray-300 font-semibold">
                        <button className="inline-flex items-center gap-2 hover:text-yellow-400 transition-colors">
                          Cliente <ArrowUpDown className="w-4 h-4" />
                        </button>
                      </th>
                      <th className="w-[180px] text-left p-3 text-gray-300 font-semibold">
                        <button className="inline-flex items-center gap-2 hover:text-yellow-400 transition-colors">
                          Valor <ArrowUpDown className="w-4 h-4" />
                        </button>
                      </th>
                      <th className="w-[150px] text-left p-3 text-gray-300 font-semibold">
                        <button className="inline-flex items-center gap-2 hover:text-yellow-400 transition-colors">
                          Status <ArrowUpDown className="w-4 h-4" />
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockTableData.map((row, index) => (
                      <tr 
                        key={index} 
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="p-3 text-white">
                          <span className="text-white font-medium">{row.customer_name}</span>
                        </td>
                        <td className="p-3 text-white">
                          <span className="text-green-400 font-medium">
                            {formatCurrency(row.amount)}
                          </span>
                        </td>
                        <td className="p-3 text-white">
                          <span className={getOverdueStatus(row.days_overdue).color}>
                            {getOverdueStatus(row.days_overdue).label}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {showCode && (
            <code className="text-xs text-gray-400 block mt-4 p-3 bg-gray-900/60 rounded">
{`// Advanced Data Table com Search
<div className="bg-black/40 rounded-lg border border-white/10 overflow-hidden">
  <div className="h-full max-h-full overflow-auto">
    <table className="w-full border-collapse min-w-full">
      <thead className="sticky top-0 z-10">
        <tr className="border-b border-white/10 bg-black/60 backdrop-blur-sm">
          <th className="text-left p-3 text-gray-300 font-semibold">
            <button className="inline-flex items-center gap-2 hover:text-yellow-400 transition-colors">
              Cliente <ArrowUpDown className="w-4 h-4" />
            </button>
          </th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => (
          <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
            <td className="p-3 text-white">{row.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>`}
            </code>
          )}
        </CardContent>
      </Card>

      {/* 5. Export Button com Loading State */}
      <Card className={getGlassCardClasses('default')}>
        <CardHeader>
          <CardTitle className={getSFProTextClasses('h4', 'accent')}>
            📤 Export Button com Loading State
          </CardTitle>
          <p className={getSFProTextClasses('body', 'secondary')}>
            Botão de exportação com estados de loading e ícones
          </p>
        </CardHeader>
        <CardContent>
          {/* Export Buttons Preview */}
          <div className="flex gap-4 items-center">
            <Button 
              variant="outline"
              className="border-adega-gold/30 text-adega-gold hover:bg-adega-gold/10"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Exportar Excel
            </Button>

            <Button 
              variant="outline"
              className="border-blue-400/30 text-blue-400 hover:bg-blue-500/10"
              disabled
            >
              <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin mr-2"></div>
              Exportando...
            </Button>

            <Button 
              variant="outline"
              className="text-xs h-7 bg-white/5 hover:bg-white/10 border-white/20"
            >
              <Download className="h-3 w-3 mr-1" />
              PDF
            </Button>
          </div>

          {showCode && (
            <code className="text-xs text-gray-400 block mt-4 p-3 bg-gray-900/60 rounded">
{`// Export Button com Loading State
<Button 
  variant="outline"
  className="border-adega-gold/30 text-adega-gold hover:bg-adega-gold/10"
  disabled={isExporting}
>
  {isExporting ? (
    <>
      <div className="w-4 h-4 border-2 border-gold-400/30 border-t-gold-400 rounded-full animate-spin mr-2"></div>
      Exportando...
    </>
  ) : (
    <>
      <FileSpreadsheet className="h-4 w-4 mr-2" />
      Exportar Excel
    </>
  )}
</Button>`}
            </code>
          )}
        </CardContent>
      </Card>

      {/* 6. Filter Badge Component */}
      <Card className={getGlassCardClasses('default')}>
        <CardHeader>
          <CardTitle className={getSFProTextClasses('h4', 'accent')}>
            🏷️ Filter Badge Component
          </CardTitle>
          <p className={getSFProTextClasses('body', 'secondary')}>
            Badge de filtro com estado ativo e botão de limpeza
          </p>
        </CardHeader>
        <CardContent>
          {/* Filter Badges Preview */}
          <div className="flex items-center gap-4">
            <div className="text-white flex items-center gap-2">
              Contas a Receber
              <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded-full border border-red-500/30">
                Atraso +30 dias
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveFilter('all')}
              className="text-xs h-7 border-gray-500/50 text-gray-300 hover:bg-gray-600/50"
            >
              Limpar Filtro
            </Button>
          </div>

          {showCode && (
            <code className="text-xs text-gray-400 block mt-4 p-3 bg-gray-900/60 rounded">
{`// Filter Badge Component
<div className="flex items-center gap-2">
  <CardTitle className="text-white">Contas a Receber</CardTitle>
  {activeFilter !== 'all' && (
    <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded-full border border-red-500/30">
      {filterLabel}
    </span>
  )}
</div>
{activeFilter !== 'all' && (
  <Button
    variant="outline"
    size="sm"
    onClick={() => setActiveFilter('all')}
    className="text-xs h-7 border-gray-500/50 text-gray-300 hover:bg-gray-600/50"
  >
    Limpar Filtro
  </Button>
)}`}
            </code>
          )}
        </CardContent>
      </Card>

      {/* 7. Margin Indicators Grid */}
      <Card className={getGlassCardClasses('default')}>
        <CardHeader>
          <CardTitle className={getSFProTextClasses('h4', 'accent')}>
            📈 Margin Indicators Grid
          </CardTitle>
          <p className={getSFProTextClasses('body', 'secondary')}>
            Grid de indicadores de margem com cores condicionais
          </p>
        </CardHeader>
        <CardContent>
          {/* Margin Indicators Preview */}
          <div className="mt-6 pt-4 border-t border-white/20 bg-white/5 rounded-lg p-4">
            <h4 className="text-sm font-bold text-yellow-300 mb-3">INDICADORES</h4>
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div className="text-center">
                <div className="text-gray-400">Margem Bruta</div>
                <div className={cn(
                  "font-bold text-lg",
                  mockDREData.margem_bruta_percent > 30 ? "text-green-400" : "text-yellow-400"
                )}>
                  {formatPercent(mockDREData.margem_bruta_percent)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-400">Margem Operacional</div>
                <div className={cn(
                  "font-bold text-lg",
                  mockDREData.margem_operacional_percent > 15 ? "text-green-400" : 
                  mockDREData.margem_operacional_percent > 5 ? "text-yellow-400" : "text-red-400"
                )}>
                  {formatPercent(mockDREData.margem_operacional_percent)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-400">Margem Líquida</div>
                <div className={cn(
                  "font-bold text-lg",
                  mockDREData.margem_liquida_percent > 10 ? "text-green-400" : 
                  mockDREData.margem_liquida_percent > 5 ? "text-yellow-400" : "text-red-400"
                )}>
                  {formatPercent(mockDREData.margem_liquida_percent)}
                </div>
              </div>
            </div>
          </div>

          {showCode && (
            <code className="text-xs text-gray-400 block mt-4 p-3 bg-gray-900/60 rounded">
{`// Margin Indicators Grid com Cores Condicionais
<div className="grid grid-cols-3 gap-4 text-xs">
  <div className="text-center">
    <div className="text-gray-400">Margem Bruta</div>
    <div className={cn(
      "font-bold text-lg",
      marginValue > 30 ? "text-green-400" : "text-yellow-400"
    )}>
      {formatPercent(marginValue)}
    </div>
  </div>
</div>`}
            </code>
          )}
        </CardContent>
      </Card>

      {/* 8. Tabbed Reports Interface */}
      <Card className={getGlassCardClasses('default')}>
        <CardHeader>
          <CardTitle className={getSFProTextClasses('h4', 'accent')}>
            📑 Tabbed Reports Interface
          </CardTitle>
          <p className={getSFProTextClasses('body', 'secondary')}>
            Interface com tabs para diferentes tipos de relatórios
          </p>
        </CardHeader>
        <CardContent>
          {/* Tabbed Interface Preview */}
          <div className="bg-black/80 border border-white/10 backdrop-blur-sm rounded-lg p-1">
            {[
              { id: 'sales', label: 'Analytics & Métricas', icon: BarChart3, color: 'blue' },
              { id: 'history', label: 'Histórico Completo', icon: History, color: 'purple' },
              { id: 'financial', label: 'Financeiro', icon: Calculator, color: 'green' }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "inline-flex items-center gap-2 px-4 py-2 rounded transition-all duration-300",
                    isActive
                      ? `data-[state=active]:bg-${tab.color}-500/20 data-[state=active]:text-${tab.color}-300 data-[state=active]:border data-[state=active]:border-${tab.color}-400/30`
                      : "text-gray-400 hover:text-white"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {showCode && (
            <code className="text-xs text-gray-400 block mt-4 p-3 bg-gray-900/60 rounded">
{`// Tabbed Reports Interface
<TabsList className="bg-black/80 border border-white/10 backdrop-blur-sm">
  <TabsTrigger 
    value="sales"
    className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300 data-[state=active]:border data-[state=active]:border-blue-400/30 transition-all duration-300"
  >
    <BarChart3 className="h-4 w-4 mr-2" />
    Analytics & Métricas
  </TabsTrigger>
</TabsList>`}
            </code>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ================================================================================================
// MOVEMENTS SECTION - Sistema de Movimentações de Estoque
// ================================================================================================
function MovementsSection({ showCode }: { showCode: boolean }) {
  const [movementType, setMovementType] = useState('in');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const mockMovementData = {
    totalMovements: 1247,
    todayMovements: 18,
    topProduct: 'Vinho Tinto Reserve',
    lastMovement: '2 minutos atrás'
  };

  const movementTypes = [
    { id: 'in', label: 'Entrada', emoji: '📦', color: 'bg-green-500/20 border-green-400/30 text-green-300' },
    { id: 'out', label: 'Saída', emoji: '📤', color: 'bg-red-500/20 border-red-400/30 text-red-300' },
    { id: 'fiado', label: 'Fiado', emoji: '💳', color: 'bg-yellow-500/20 border-yellow-400/30 text-yellow-300' },
    { id: 'devolucao', label: 'Devolução', emoji: '🔄', color: 'bg-purple-500/20 border-purple-400/30 text-purple-300' }
  ];

  const mockMovements = [
    { id: 1, date: '2024-01-10 14:32', type: 'in', product: 'Vinho Tinto Reserve', quantity: 24, user: 'João Silva' },
    { id: 2, date: '2024-01-10 13:45', type: 'out', product: 'Espumante Premium', quantity: 3, user: 'Ana Costa' },
    { id: 3, date: '2024-01-10 12:20', type: 'fiado', product: 'Whisky Single Malt', quantity: 1, user: 'João Silva' },
    { id: 4, date: '2024-01-09 16:05', type: 'devolucao', product: 'Vodka Premium', quantity: 2, user: 'Ana Costa' }
  ];

  return (
    <div className="space-y-8">
      {/* Header da Seção */}
      <Card className={getGlassCardClasses('premium')}>
        <CardHeader>
          <CardTitle className={getSFProTextClasses('h3', 'accent')}>
            📦 Sistema de Movimentações de Estoque
          </CardTitle>
          <p className={getSFProTextClasses('body', 'secondary')}>
            Data tables avançados, badges coloridos, formulários condicionais e mouse tracking
          </p>
        </CardHeader>
      </Card>

      {/* 1. Movement Type Cards com Badges Coloridos */}
      <Card className={getGlassCardClasses('default')}>
        <CardHeader>
          <CardTitle className={getSFProTextClasses('h4', 'accent')}>
            🏷️ Movement Type Cards com Badges Coloridos
          </CardTitle>
          <p className={getSFProTextClasses('body', 'secondary')}>
            Sistema de badges temáticos por tipo de movimentação
          </p>
        </CardHeader>
        <CardContent>
          {/* Movement Type Selector */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {movementTypes.map((type) => (
              <div 
                key={type.id}
                className={cn(
                  "p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:scale-105",
                  movementType === type.id ? type.color : "bg-gray-800/40 border-gray-600/30 text-gray-400 hover:border-gray-500/50"
                )}
                onClick={() => setMovementType(type.id)}
              >
                <div className="text-2xl mb-2">{type.emoji}</div>
                <h4 className="font-medium">{type.label}</h4>
                <p className="text-xs opacity-75 mt-1">
                  {type.id === 'in' && 'Entrada de produtos'}
                  {type.id === 'out' && 'Saída por venda'}
                  {type.id === 'fiado' && 'Venda a prazo'}
                  {type.id === 'devolucao' && 'Retorno de produto'}
                </p>
              </div>
            ))}
          </div>

          {/* Badge Examples */}
          <div className="flex flex-wrap gap-2 mb-4">
            {movementTypes.map((type) => (
              <span key={type.id} className={cn("px-3 py-1 rounded-full text-sm font-medium", type.color)}>
                {type.emoji} {type.label}
              </span>
            ))}
          </div>

          {showCode && (
            <code className="text-xs text-gray-400 block mt-4 p-3 bg-gray-900/60 rounded">
{`// Movement Type Cards com Badges Coloridos
const movementTypes = [
  { id: 'in', label: 'Entrada', emoji: '📦', color: 'bg-green-500/20 border-green-400/30 text-green-300' },
  { id: 'out', label: 'Saída', emoji: '📤', color: 'bg-red-500/20 border-red-400/30 text-red-300' },
  { id: 'fiado', label: 'Fiado', emoji: '💳', color: 'bg-yellow-500/20 border-yellow-400/30 text-yellow-300' },
  { id: 'devolucao', label: 'Devolução', emoji: '🔄', color: 'bg-purple-500/20 border-purple-400/30 text-purple-300' }
];

<span className={\`px-3 py-1 rounded-full text-sm font-medium \${typeInfo[movement.type]?.color}\`}>
  {typeInfo[movement.type]?.label || movement.type}
</span>`}
            </code>
          )}
        </CardContent>
      </Card>

      {/* 2. Data Table com Column Toggle & Sort Avançado */}
      <Card className={getGlassCardClasses('default')}>
        <CardHeader>
          <CardTitle className={getSFProTextClasses('h4', 'accent')}>
            📊 Data Table com Column Toggle & Sort Avançado
          </CardTitle>
          <p className={getSFProTextClasses('body', 'secondary')}>
            Tabela com controle de colunas visíveis e ordenação multi-critério
          </p>
        </CardHeader>
        <CardContent>
          {/* Table Controls */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <span>{mockMovements.length} de 1247 registros</span>
              <span className="text-yellow-400">(limitado a 50)</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="border-gray-600 text-gray-300">
                Colunas <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="border-gray-600 text-gray-300"
                onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
              >
                {sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                Ordenar
              </Button>
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-black/40 rounded-lg border border-white/10 overflow-hidden">
            <table className="w-full">
              <thead className="bg-black/60 border-b border-white/10">
                <tr>
                  <th className="text-left p-3 text-gray-300 font-medium">
                    <button className="flex items-center gap-2 hover:text-yellow-400">
                      Data <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="text-left p-3 text-gray-300 font-medium">
                    <button className="flex items-center gap-2 hover:text-yellow-400">
                      Tipo <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="text-left p-3 text-gray-300 font-medium">
                    <button className="flex items-center gap-2 hover:text-yellow-400">
                      Produto <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="text-left p-3 text-gray-300 font-medium">
                    <button className="flex items-center gap-2 hover:text-yellow-400">
                      Qtd <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="text-left p-3 text-gray-300 font-medium">Responsável</th>
                </tr>
              </thead>
              <tbody>
                {mockMovements.map((movement, index) => (
                  <tr key={movement.id} className={`border-b border-white/5 hover:bg-white/5 ${index % 2 === 0 ? 'bg-black/10' : 'bg-black/20'}`}>
                    <td className="p-3 text-gray-300 text-sm">
                      {new Date(movement.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-3">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        movementTypes.find(t => t.id === movement.type)?.color || 'bg-gray-500/20 text-gray-300'
                      )}>
                        {movementTypes.find(t => t.id === movement.type)?.emoji} {movementTypes.find(t => t.id === movement.type)?.label}
                      </span>
                    </td>
                    <td className="p-3 text-white font-medium">{movement.product}</td>
                    <td className="p-3 text-white font-medium text-center">{movement.quantity}</td>
                    <td className="p-3 text-gray-300 text-sm">{movement.user}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {showCode && (
            <code className="text-xs text-gray-400 block mt-4 p-3 bg-gray-900/60 rounded">
{`// Data Table com Column Toggle & Sort
<th className="text-left p-3">
  <button className="flex items-center gap-2 hover:text-yellow-400" onClick={() => handleSort('date')}>
    Data {sortField === 'date' ? (sortDirection === 'asc' ? <ArrowUp /> : <ArrowDown />) : <ArrowUpDown />}
  </button>
</th>

// Controls
<Button variant="outline" size="sm">
  Colunas <ChevronDown className="h-3 w-3 ml-1" />
</Button>`}
            </code>
          )}
        </CardContent>
      </Card>

      {/* 3. Purple Glow Effect com Mouse Tracking */}
      <Card className={getGlassCardClasses('default')}>
        <CardHeader>
          <CardTitle className={getSFProTextClasses('h4', 'accent')}>
            🎨 Purple Glow Effect com Mouse Tracking
          </CardTitle>
          <p className={getSFProTextClasses('body', 'secondary')}>
            Efeito de glow roxo que segue o movimento do mouse
          </p>
        </CardHeader>
        <CardContent>
          {/* Purple Glow Container */}
          <div 
            className="h-40 bg-black/80 border border-white/10 rounded-xl shadow-lg hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-400/30 transition-all duration-300 relative overflow-hidden group cursor-pointer"
            onMouseMove={(e) => {
              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
              const x = ((e.clientX - rect.left) / rect.width) * 100;
              const y = ((e.clientY - rect.top) / rect.height) * 100;
              (e.currentTarget as HTMLElement).style.setProperty("--x", `${x}%`);
              (e.currentTarget as HTMLElement).style.setProperty("--y", `${y}%`);
            }}
          >
            <div 
              className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500/20 via-transparent to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{
                background: `radial-gradient(300px circle at var(--x, 50%) var(--y, 50%), rgba(147, 51, 234, 0.15), transparent 40%)`
              }}
            />
            
            <div className="relative z-10 h-full flex items-center justify-center">
              <div className="text-center">
                <Package2 className="h-12 w-12 text-purple-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-white mb-2">Container Interativo</h3>
                <p className="text-gray-400 text-sm">Mova o mouse para ver o efeito de glow roxo</p>
              </div>
            </div>
          </div>

          {/* Counter Badge with Purple Glow */}
          <div className="mt-4 flex justify-center">
            <div 
              className="bg-black/50 backdrop-blur-sm border border-purple-400/30 rounded-full px-6 py-3 shadow-lg hover:shadow-xl hover:shadow-purple-400/20 hover:border-purple-400/50 hover:scale-105 transition-all duration-300 relative overflow-hidden group cursor-pointer"
              onMouseMove={(e) => {
                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                (e.currentTarget as HTMLElement).style.setProperty("--x", `${x}%`);
                (e.currentTarget as HTMLElement).style.setProperty("--y", `${y}%`);
              }}
            >
              <div 
                className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/20 via-transparent to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: `radial-gradient(200px circle at var(--x, 50%) var(--y, 50%), rgba(147, 51, 234, 0.15), transparent 40%)`
                }}
              />
              <span className="text-lg font-bold text-gray-100 relative z-10">{mockMovementData.totalMovements}</span>
              <span className="text-sm ml-2 opacity-75 text-gray-300 relative z-10">movimentações</span>
            </div>
          </div>

          {showCode && (
            <code className="text-xs text-gray-400 block mt-4 p-3 bg-gray-900/60 rounded">
{`// Purple Glow Effect com Mouse Tracking
<div 
  className="relative overflow-hidden group"
  onMouseMove={(e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    e.currentTarget.style.setProperty("--x", \`\${x}%\`);
    e.currentTarget.style.setProperty("--y", \`\${y}%\`);
  }}
>
  <div 
    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
    style={{
      background: \`radial-gradient(300px circle at var(--x, 50%) var(--y, 50%), rgba(147, 51, 234, 0.15), transparent 40%)\`
    }}
  />
</div>`}
            </code>
          )}
        </CardContent>
      </Card>

      {/* 4. Multi-Step Form Dialog Condicional */}
      <Card className={getGlassCardClasses('default')}>
        <CardHeader>
          <CardTitle className={getSFProTextClasses('h4', 'accent')}>
            📝 Multi-Step Form Dialog Condicional
          </CardTitle>
          <p className={getSFProTextClasses('body', 'secondary')}>
            Formulário que muda campos baseado no tipo selecionado
          </p>
        </CardHeader>
        <CardContent>
          {/* Form Dialog Preview */}
          <div className="space-y-6 p-6 bg-black/40 border border-white/10 rounded-lg">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Package className="h-4 w-4 text-blue-400" />
                Tipo de Movimentação
              </h3>
              <Select value={movementType} onValueChange={setMovementType}>
                <SelectTrigger className="bg-gray-800/60 border-gray-600/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in">📦 Entrada</SelectItem>
                  <SelectItem value="out">📤 Saída</SelectItem>
                  <SelectItem value="fiado">💳 Fiado</SelectItem>
                  <SelectItem value="devolucao">🔄 Devolução</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Conditional Section: Fiado */}
            {movementType === 'fiado' && (
              <div className="space-y-4 border-l-4 border-yellow-400/50 pl-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-yellow-400" />
                  Informações do Fiado
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <Select>
                    <SelectTrigger className="bg-gray-800/60 border-gray-600/50">
                      <SelectValue placeholder="Selecione o cliente..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="carlos">Carlos Oliveira</SelectItem>
                      <SelectItem value="maria">Maria Santos</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input type="date" className="bg-gray-800/60 border-gray-600/50" />
                </div>
              </div>
            )}

            {/* Conditional Section: Devolução */}
            {movementType === 'devolucao' && (
              <div className="space-y-4 border-l-4 border-purple-400/50 pl-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <RotateCcw className="h-4 w-4 text-orange-400" />
                  Devolução
                </h3>
                <Select>
                  <SelectTrigger className="bg-gray-800/60 border-gray-600/50">
                    <SelectValue placeholder="Selecione a venda original..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sale1">09/01/2024 - abc123</SelectItem>
                    <SelectItem value="sale2">08/01/2024 - def456</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {showCode && (
            <code className="text-xs text-gray-400 block mt-4 p-3 bg-gray-900/60 rounded">
{`// Multi-Step Form Dialog Condicional
{movementType === 'fiado' && (
  <div className="space-y-4 border-l-4 border-yellow-400/50 pl-4">
    <h3 className="flex items-center gap-2">
      <CreditCard className="h-4 w-4 text-yellow-400" />
      Informações do Fiado
    </h3>
  </div>
)}

{movementType === 'devolucao' && (
  <div className="space-y-4 border-l-4 border-purple-400/50 pl-4">
    <h3 className="flex items-center gap-2">
      <RotateCcw className="h-4 w-4 text-orange-400" />
      Devolução
    </h3>
  </div>
)}`}
            </code>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// EXPENSES SECTION - GESTÃO DE DESPESAS
// ============================================================================

function ExpensesSection({ showCode }: { showCode: boolean }) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <Card className={getGlassCardClasses('premium')}>
        <CardHeader>
          <CardTitle className={getSFProTextClasses('h3', 'accent')}>
            💰 Gestão de Despesas - Componentes Únicos
          </CardTitle>
          <p className={getSFProTextClasses('body', 'secondary')}>
            Padrões visuais especializados para controle financeiro empresarial
          </p>
        </CardHeader>
      </Card>

      {/* 1. Red-Yellow Gradient Title */}
      <Card className={getGlassCardClasses()}>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Receipt className="h-5 w-5 text-red-400" />
            1. Título Gradiente Vermelho-Amarelo com Sublinhado
          </CardTitle>
          <p className="text-gray-400 text-sm">
            Gradiente especializado para despesas com efeito de sublinhado multicamadas
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative text-center">
            <h1 className={cn(
              getSFProTextClasses('h1', 'accent'),
              "text-transparent bg-clip-text bg-gradient-to-r from-[#FF2400] via-[#FFDA04] to-[#FF2400] drop-shadow-lg"
            )}
            style={{
              textShadow: '0 2px 4px rgba(0,0,0,0.3), 0 0 20px rgba(255, 218, 4, 0.2)'
            }}>
              GESTÃO DE DESPESAS
            </h1>
            
            <div className="w-full h-6 relative mt-2">
              <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FF2400]/80 to-transparent h-[2px] w-full blur-sm" />
              <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FF2400] to-transparent h-px w-full" />
              <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FFDA04]/80 to-transparent h-[3px] w-3/4 blur-sm mx-auto" />
              <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FFDA04] to-transparent h-px w-3/4 mx-auto" />
            </div>
          </div>

          {showCode && (
            <code className="block bg-black/40 p-4 rounded-lg text-sm text-gray-300 overflow-x-auto">
{`<h1 className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF2400] via-[#FFDA04] to-[#FF2400]">
  GESTÃO DE DESPESAS
</h1>
<div className="w-full h-6 relative mt-2">
  <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FF2400]/80 to-transparent h-[2px] w-full blur-sm" />
  <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-[#FFDA04] to-transparent h-px w-3/4 mx-auto" />
</div>`}
            </code>
          )}
        </CardContent>
      </Card>

      {/* 2. Hero Spotlight Container */}
      <Card className={getGlassCardClasses()}>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-400" />
            2. Container Hero com Spotlight Interativo
          </CardTitle>
          <p className="text-gray-400 text-sm">
            Container com tracking do mouse para efeito spotlight dinâmico
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <section 
            className="bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg hero-spotlight p-6 flex flex-col hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-400/30 transition-all duration-300 overflow-visible space-y-6 h-32"
            onMouseMove={(e) => {
              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
              const x = ((e.clientX - rect.left) / rect.width) * 100;
              const y = ((e.clientY - rect.top) / rect.height) * 100;
              (e.currentTarget as HTMLElement).style.setProperty("--x", `${x}%`);
              (e.currentTarget as HTMLElement).style.setProperty("--y", `${y}%`);
            }}
          >
            <div className="text-white text-center">
              <h3 className="text-lg font-semibold mb-2">Container com Spotlight</h3>
              <p className="text-gray-400 text-sm">Mova o mouse sobre este container para ver o efeito</p>
            </div>
          </section>

          {showCode && (
            <code className="block bg-black/40 p-4 rounded-lg text-sm text-gray-300 overflow-x-auto">
{`<section 
  className="hero-spotlight"
  onMouseMove={(e) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    (e.currentTarget as HTMLElement).style.setProperty("--x", \`\${x}%\`);
    (e.currentTarget as HTMLElement).style.setProperty("--y", \`\${y}%\`);
  }}
>
  {/* Conteúdo */}
</section>`}
            </code>
          )}
        </CardContent>
      </Card>

      {/* 3. Expense KPIs */}
      <Card className={getGlassCardClasses()}>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart4 className="h-5 w-5 text-yellow-400" />
            3. KPIs Financeiros de Despesas
          </CardTitle>
          <p className="text-gray-400 text-sm">
            Cards especializados para métricas de despesas
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className={getGlassCardClasses()}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Receipt className="h-8 w-8 text-blue-400" />
                  <div>
                    <div className="text-xl font-bold text-white font-sf-pro">R$ 12.350,00</div>
                    <div className="text-sm text-gray-400 font-sf-pro">Total de Despesas</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={getGlassCardClasses()}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Calculator className="h-8 w-8 text-purple-400" />
                  <div>
                    <div className="text-xl font-bold text-white font-sf-pro">R$ 262,77</div>
                    <div className="text-sm text-gray-400 font-sf-pro">Ticket Médio</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={getGlassCardClasses()}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <BarChart4 className="h-8 w-8 text-yellow-400" />
                  <div>
                    <div className="text-lg font-bold text-white font-sf-pro">Escritório</div>
                    <div className="text-sm text-gray-400 font-sf-pro">R$ 3.420,00</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {showCode && (
            <code className="block bg-black/40 p-4 rounded-lg text-sm text-gray-300 overflow-x-auto">
{`<Card className={getGlassCardClasses()}>
  <CardContent className="p-4">
    <div className="flex items-center gap-3">
      <Receipt className="h-8 w-8 text-blue-400" />
      <div>
        <div className="text-xl font-bold text-white font-sf-pro">
          {formatCurrency(expenseSummary.total_expenses)}
        </div>
        <div className="text-sm text-gray-400 font-sf-pro">Total de Despesas</div>
      </div>
    </div>
  </CardContent>
</Card>`}
            </code>
          )}
        </CardContent>
      </Card>

      {/* 4. Category Filter with Icons */}
      <Card className={getGlassCardClasses()}>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Filter className="h-5 w-5 text-orange-400" />
            4. Filtro de Categoria com Ícones
          </CardTitle>
          <p className="text-gray-400 text-sm">
            Seletor visual de categorias com ícones coloridos
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-700 border-gray-600 rounded-lg p-3 flex items-center gap-3">
            <div className="p-1.5 rounded-md flex-shrink-0" style={{ backgroundColor: '#10B98120', border: '1px solid #10B98140' }}>
              <Home className="h-4 w-4" style={{ color: '#10B981' }} />
            </div>
            <div className="flex flex-col items-start min-w-0 flex-1">
              <span className="font-medium text-white">Casa & Moradia</span>
              <span className="text-xs text-gray-400">Aluguel, condomínio, IPTU</span>
            </div>
          </div>

          {showCode && (
            <code className="block bg-black/40 p-4 rounded-lg text-sm text-gray-300 overflow-x-auto">
{`<div className="bg-gray-700 border-gray-600 rounded-lg p-3 flex items-center gap-3">
  <div 
    className="p-1.5 rounded-md flex-shrink-0"
    style={{ 
      backgroundColor: \`\${category.color}20\`,
      border: \`1px solid \${category.color}40\`
    }}
  >
    <IconComponent 
      className="h-4 w-4" 
      style={{ color: category.color }}
    />
  </div>
  <div className="flex flex-col items-start min-w-0 flex-1">
    <span className="font-medium text-white">{category.name}</span>
    <span className="text-xs text-gray-400">{category.description}</span>
  </div>
</div>`}
            </code>
          )}
        </CardContent>
      </Card>

      {/* 5. Expense Empty State */}
      <Card className={getGlassCardClasses()}>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-400" />
            5. Estado Vazio com Ilustração Flutuante
          </CardTitle>
          <p className="text-gray-400 text-sm">
            Empty state contextual com ícones animados
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="py-12 text-center space-y-6">
            <div className="relative mx-auto w-24 h-24">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-2 border-dashed border-purple-500/30 animate-pulse"></div>
              
              <div className="absolute inset-0 flex items-center justify-center">
                <Receipt className="h-8 w-8 text-purple-400" />
              </div>
              
              <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center">
                <TrendingUp className="h-3 w-3 text-green-400" />
              </div>
              <div className="absolute -bottom-2 -left-2 w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
                <Calendar className="h-3 w-3 text-blue-400" />
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-bold text-white font-sf-pro">
                Comece a gerenciar suas despesas
              </h3>
              <p className="text-gray-400">
                Você ainda não tem nenhuma despesa cadastrada
              </p>

              <Button className={cn(
                getGlassButtonClasses('primary'),
                getHoverTransformClasses('scale'),
                "flex items-center gap-2 shadow-lg shadow-purple-500/25"
              )}>
                <Plus className="h-4 w-4" />
                Cadastrar Primeira Despesa
              </Button>
            </div>
          </div>

          {showCode && (
            <code className="block bg-black/40 p-4 rounded-lg text-sm text-gray-300 overflow-x-auto">
{`<div className="relative mx-auto w-24 h-24">
  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-2 border-dashed border-purple-500/30 animate-pulse"></div>
  
  <div className="absolute inset-0 flex items-center justify-center">
    <Receipt className="h-8 w-8 text-purple-400" />
  </div>
  
  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center">
    <TrendingUp className="h-3 w-3 text-green-400" />
  </div>
</div>`}
            </code>
          )}
        </CardContent>
      </Card>

      {/* 6. Payment Method Translation */}
      <Card className={getGlassCardClasses()}>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-green-400" />
            6. Tradução de Métodos de Pagamento
          </CardTitle>
          <p className="text-gray-400 text-sm">
            Sistema de tradução para métodos de pagamento
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-gray-300 p-2 bg-black/20 rounded">
              <CreditCard className="h-4 w-4" />
              Cartão de Crédito
            </div>
            <div className="flex items-center gap-2 text-gray-300 p-2 bg-black/20 rounded">
              <CreditCard className="h-4 w-4" />
              PIX
            </div>
            <div className="flex items-center gap-2 text-gray-300 p-2 bg-black/20 rounded">
              <CreditCard className="h-4 w-4" />
              Dinheiro
            </div>
            <div className="flex items-center gap-2 text-gray-300 p-2 bg-black/20 rounded">
              <CreditCard className="h-4 w-4" />
              Transferência
            </div>
          </div>

          {showCode && (
            <code className="block bg-black/40 p-4 rounded-lg text-sm text-gray-300 overflow-x-auto">
{`const translatePaymentMethod = (method: string) => {
  const translations: Record<string, string> = {
    'credit_card': 'Cartão de Crédito',
    'debit_card': 'Cartão de Débito',
    'pix': 'PIX',
    'cash': 'Dinheiro',
    'bank_transfer': 'Transferência',
    'check': 'Cheque',
    'other': 'Outro'
  };
  return translations[method] || method;
};

// Uso no componente:
<div className="flex items-center gap-2 text-gray-300">
  <CreditCard className="h-4 w-4" />
  {translatePaymentMethod(expense.payment_method)}
</div>`}
            </code>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// SISTEMA DE USUÁRIOS - 6 componentes únicos
// ============================================================================

function UsersSection({ showCode }: { showCode: boolean }) {
  const [showFirstAdminSetup, setShowFirstAdminSetup] = useState(false);
  const [showUserCreate, setShowUserCreate] = useState(false);
  const [showUserActions, setShowUserActions] = useState(false);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className={cn(getSFProTextClasses('h2', 'primary'))}>
          Sistema de Usuários
        </h2>
        <p className={cn(getSFProTextClasses('body', 'secondary'), 'mt-2')}>
          Componentes especializados para gerenciamento de usuários, roles e permissões
        </p>
      </div>

      {/* First Admin Setup Card */}
      <Card className={getGlassCardClasses()}>
        <CardHeader>
          <CardTitle className={getSFProTextClasses('h3', 'primary')}>
            First Admin Setup Card
          </CardTitle>
          <p className={getSFProTextClasses('body', 'secondary')}>
            Card especializado para configuração inicial do sistema com Crown icon dourado
          </p>
        </CardHeader>
        <CardContent>
          {/* Demo */}
          <Card className="w-full max-w-md bg-adega-charcoal/20 border-white/10 mx-auto">
            <CardHeader className="text-center">
              <Crown className="h-16 w-16 text-adega-gold mx-auto mb-4" />
              <CardTitle className="text-2xl text-adega-platinum">
                Configuração Inicial
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-adega-platinum/80">
                Nenhum usuário encontrado no sistema. Crie o primeiro administrador para começar.
              </p>
              
              <div className="bg-adega-charcoal/30 border border-white/10 p-4 rounded-lg text-sm">
                <p className="text-adega-platinum">
                  <strong>Email:</strong> adm@adm.com
                </p>
                <p className="text-adega-platinum">
                  <strong>Senha:</strong> adm123
                </p>
                <p className="text-xs text-adega-platinum/60 mt-2">
                  (Recomendamos alterar a senha após o primeiro login)
                </p>
              </div>
              
              <Button 
                className="w-full bg-adega-gold hover:bg-adega-gold/80 text-black" 
                size="lg"
              >
                Criar Administrador Supremo
              </Button>
            </CardContent>
          </Card>

          {/* Code */}
          {showCode && (
            <code className="block bg-gray-900 text-green-400 p-4 rounded mt-4 text-sm overflow-x-auto">
{`<Card className="w-full max-w-md bg-adega-charcoal/20 border-white/10">
  <CardHeader className="text-center">
    <Crown className="h-16 w-16 text-adega-gold mx-auto mb-4" />
    <CardTitle className="text-2xl text-adega-platinum">
      Configuração Inicial
    </CardTitle>
  </CardHeader>
  <CardContent className="text-center space-y-4">
    <div className="bg-adega-charcoal/30 border border-white/10 p-4 rounded-lg text-sm">
      <p className="text-adega-platinum"><strong>Email:</strong> adm@adm.com</p>
      <p className="text-adega-platinum"><strong>Senha:</strong> adm123</p>
    </div>
    <Button className="w-full bg-adega-gold hover:bg-adega-gold/80 text-black" size="lg">
      Criar Administrador Supremo
    </Button>
  </CardContent>
</Card>`}
            </code>
          )}
        </CardContent>
      </Card>

      {/* User Role Badge */}
      <Card className={getGlassCardClasses()}>
        <CardHeader>
          <CardTitle className={getSFProTextClasses('h3', 'primary')}>
            User Role Badge
          </CardTitle>
          <p className={getSFProTextClasses('body', 'secondary')}>
            Badge colorido dinâmico baseado no role do usuário
          </p>
        </CardHeader>
        <CardContent>
          {/* Demo */}
          <div className="flex flex-wrap gap-3 items-center">
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30" variant="outline">
              Administrador
            </Badge>
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30" variant="outline">
              Funcionário
            </Badge>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30" variant="outline">
              Entregador
            </Badge>
          </div>

          {/* Code */}
          {showCode && (
            <code className="block bg-gray-900 text-green-400 p-4 rounded mt-4 text-sm overflow-x-auto">
{`const getRoleColor = (role: string): string => {
  switch (role) {
    case 'admin':
      return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    case 'employee':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'delivery':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
};

<Badge className={getRoleColor(role)} variant="outline">
  {getRoleDisplay(role)}
</Badge>`}
            </code>
          )}
        </CardContent>
      </Card>

      {/* User Status Badge */}
      <Card className={getGlassCardClasses()}>
        <CardHeader>
          <CardTitle className={getSFProTextClasses('h3', 'primary')}>
            User Status Badge
          </CardTitle>
          <p className={getSFProTextClasses('body', 'secondary')}>
            Badge para status de usuário: Ativo, Inativo, Pendente
          </p>
        </CardHeader>
        <CardContent>
          {/* Demo */}
          <div className="flex flex-wrap gap-3 items-center">
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30" variant="outline">
              Ativo
            </Badge>
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30" variant="outline">
              Inativo
            </Badge>
            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30" variant="outline">
              Pendente
            </Badge>
          </div>

          {/* Code */}
          {showCode && (
            <code className="block bg-gray-900 text-green-400 p-4 rounded mt-4 text-sm overflow-x-auto">
{`const getStatusColor = (status: string): string => {
  switch (status) {
    case 'active':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'inactive':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'pending':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
};

<Badge className={getStatusColor(status)} variant="outline">
  {getStatusDisplay(status)}
</Badge>`}
            </code>
          )}
        </CardContent>
      </Card>

      {/* User Actions Dropdown */}
      <Card className={getGlassCardClasses()}>
        <CardHeader>
          <CardTitle className={getSFProTextClasses('h3', 'primary')}>
            User Actions Dropdown
          </CardTitle>
          <p className={getSFProTextClasses('body', 'secondary')}>
            Menu de ações com confirmações de segurança e proteção de supreme admin
          </p>
        </CardHeader>
        <CardContent>
          {/* Demo */}
          <div className="flex items-center gap-4 p-4 bg-black/40 rounded-lg border border-white/10">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-white font-medium">João Silva</p>
                <p className="text-gray-400 text-sm">joao@empresa.com</p>
              </div>
            </div>
            
            <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => setShowUserActions(!showUserActions)}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>

          {showUserActions && (
            <div className="mt-4 p-3 bg-adega-charcoal rounded-lg border border-white/10 space-y-2">
              <div className="flex items-center gap-2 p-2 hover:bg-white/10 rounded cursor-pointer text-white">
                <Edit className="h-4 w-4" />
                <span>Editar usuário</span>
              </div>
              <div className="flex items-center gap-2 p-2 hover:bg-amber-500/10 rounded cursor-pointer text-amber-400">
                <KeyRound className="h-4 w-4" />
                <span>Resetar senha</span>
              </div>
              <div className="flex items-center gap-2 p-2 hover:bg-red-500/10 rounded cursor-pointer text-red-400">
                <Trash2 className="h-4 w-4" />
                <span>Remover usuário</span>
              </div>
            </div>
          )}

          {/* Code */}
          {showCode && (
            <code className="block bg-gray-900 text-green-400 p-4 rounded mt-4 text-sm overflow-x-auto">
{`<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" className="h-8 w-8 p-0">
      <MoreHorizontal className="h-4 w-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end" className="bg-adega-charcoal border-white/10">
    <DropdownMenuItem onClick={handleEdit}>
      <Edit className="mr-2 h-4 w-4" />
      Editar usuário
    </DropdownMenuItem>
    <DropdownMenuItem onClick={handleResetPassword}>
      <KeyRound className="mr-2 h-4 w-4" />
      Resetar senha
    </DropdownMenuItem>
    <DropdownMenuItem onClick={handleDelete}>
      <Trash2 className="mr-2 h-4 w-4" />
      Remover usuário
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`}
            </code>
          )}
        </CardContent>
      </Card>

      {/* Advanced User Table */}
      <Card className={getGlassCardClasses()}>
        <CardHeader>
          <CardTitle className={getSFProTextClasses('h3', 'primary')}>
            Advanced User Table
          </CardTitle>
          <p className={getSFProTextClasses('body', 'secondary')}>
            Tabela avançada com search, sorting, column visibility controls
          </p>
        </CardHeader>
        <CardContent>
          {/* Demo */}
          <div className="space-y-4">
            {/* Controls */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 flex-1 max-w-sm">
                <Search className="h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Buscar usuários..." 
                  className="bg-black/40 border-white/20 text-white"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="border-white/20 text-white">
                  <Settings className="h-4 w-4 mr-2" />
                  Colunas
                </Button>
                <Button variant="outline" size="sm" className="border-white/20 text-white">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  Ordenar
                </Button>
              </div>
            </div>

            {/* Table */}
            <div className="border border-white/10 rounded-lg overflow-hidden">
              <div className="grid grid-cols-5 gap-4 p-3 bg-white/5 border-b border-white/10 text-gray-300 text-sm font-medium">
                <div>Nome</div>
                <div>Email</div>
                <div>Role</div>
                <div>Status</div>
                <div>Ações</div>
              </div>
              <div className="grid grid-cols-5 gap-4 p-3 items-center hover:bg-white/5 border-b border-white/10 last:border-b-0">
                <div className="text-white">João Silva</div>
                <div className="text-gray-400">joao@empresa.com</div>
                <div>
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30" variant="outline">
                    Administrador
                  </Badge>
                </div>
                <div>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30" variant="outline">
                    Ativo
                  </Badge>
                </div>
                <div>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Code */}
          {showCode && (
            <code className="block bg-gray-900 text-green-400 p-4 rounded mt-4 text-sm overflow-x-auto">
{`// Controles de busca e filtros
<div className="flex items-center justify-between gap-4">
  <div className="flex items-center gap-2 flex-1 max-w-sm">
    <Search className="h-4 w-4 text-gray-400" />
    <Input placeholder="Buscar usuários..." value={searchTerm} />
  </div>
  <ColumnVisibilityDropdown />
  <SortingControls />
</div>

// Tabela responsiva
<div className="border border-white/10 rounded-lg">
  <div className="grid grid-cols-5 gap-4 p-3 bg-white/5 border-b border-white/10 text-gray-300 text-sm font-medium">
    <div>Nome</div>
    <div>Email</div>
    <div>Role</div>
    <div>Status</div>
    <div>Ações</div>
  </div>
  {users.map(user => (
    <div key={user.id} className="grid grid-cols-5 gap-4 p-3 items-center hover:bg-white/5 border-b border-white/10">
      <div className="text-white">{user.name}</div>
      <div className="text-gray-400">{user.email}</div>
      <div><UserRoleBadge role={user.role} /></div>
      <div><UserStatusBadge status={user.status} /></div>
      <div><UserActions user={user} /></div>
    </div>
  ))}
</div>`}
            </code>
          )}
        </CardContent>
      </Card>

      {/* User Creation Dialog */}
      <Card className={getGlassCardClasses()}>
        <CardHeader>
          <CardTitle className={getSFProTextClasses('h3', 'primary')}>
            User Creation Dialog
          </CardTitle>
          <p className={getSFProTextClasses('body', 'secondary')}>
            Modal especializado para criação de usuários com gradient dourado
          </p>
        </CardHeader>
        <CardContent>
          {/* Demo Button */}
          <Button 
            onClick={() => setShowUserCreate(!showUserCreate)}
            className="bg-black/80 border-[#FFD700]/40 text-[#FFD700] hover:bg-[#FFD700]/20 hover:shadow-xl hover:shadow-[#FFD700]/30 hover:border-[#FFD700]/80"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Usuário
          </Button>

          {/* Mock Dialog Preview */}
          {showUserCreate && (
            <div className="mt-4 p-6 bg-gray-900/95 border border-white/20 rounded-lg backdrop-blur-xl max-w-md mx-auto">
              <div className="text-center mb-4">
                <h3 className="text-2xl font-bold text-white mb-2">Criar Novo Usuário</h3>
                <p className="text-gray-400 mb-2">Preencha as informações abaixo</p>
                <div className="w-16 h-1 bg-gradient-to-r from-[#FFD700] to-[#FFA500] mx-auto rounded-full"></div>
              </div>
              
              <div className="space-y-4">
                <Input placeholder="Nome completo" className="bg-black/40 border-white/20 text-white" />
                <Input placeholder="Email" className="bg-black/40 border-white/20 text-white" />
                <Input placeholder="Senha" type="password" className="bg-black/40 border-white/20 text-white" />
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1 border-white/20 text-white"
                    onClick={() => setShowUserCreate(false)}
                  >
                    Cancelar
                  </Button>
                  <Button className="flex-1 bg-[#FFD700] text-black hover:bg-[#FFD700]/80">
                    Criar Usuário
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Code */}
          {showCode && (
            <code className="block bg-gray-900 text-green-400 p-4 rounded mt-4 text-sm overflow-x-auto">
{`<Dialog open={isOpen} onOpenChange={onClose}>
  <DialogContent className="max-w-md bg-gray-900/95 border-white/20 backdrop-blur-xl shadow-2xl">
    <DialogHeader>
      <DialogTitle className="text-2xl font-bold text-white text-center mb-2">
        Criar Novo Usuário
      </DialogTitle>
      <DialogDescription className="text-gray-400 text-center mb-2">
        Preencha as informações abaixo para criar um novo usuário.
      </DialogDescription>
      <div className="w-16 h-1 bg-gradient-to-r from-[#FFD700] to-[#FFA500] mx-auto rounded-full"></div>
    </DialogHeader>
    
    <UserForm onSubmit={handleSubmit} onCancel={handleCancel} />
  </DialogContent>
</Dialog>`}
            </code>
          )}
        </CardContent>
      </Card>
    </div>
  );
}