/**
 * Componente de demonstração do sistema de temas Adega
 * Para uso em desenvolvimento e documentação
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Package, 
  DollarSign, 
  AlertTriangle,
  TrendingUp,
  Star,
  Check,
  X,
  Info
} from 'lucide-react';
import {
  cardVariants,
  buttonVariants,
  inputVariants,
  getTextClasses,
  getValueClasses,
  getIconClasses,
  getCustomerSegmentClasses,
  getStockStatusClasses,
  getTurnoverClasses,
  gridLayouts,
  flexLayouts,
  transitionClasses
} from '@/lib/theme-utils';
import { adegaColors, semanticColors } from '@/lib/theme';

export const ThemeShowcase: React.FC = () => {
  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className={getTextClasses('heading')}>
          Sistema de Temas Adega Wine Cellar
        </h1>
        <p className={getTextClasses('body')}>
          Demonstração das cores, componentes e padrões visuais padronizados
        </p>
      </div>

      {/* Paleta de Cores */}
      <section className="space-y-4">
        <h2 className={getTextClasses('subheading')}>Paleta de Cores</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Object.entries(adegaColors).map(([name, color]) => (
            <div key={name} className="text-center">
              <div 
                className="w-full h-16 rounded-lg mb-2 border border-white/10"
                style={{ backgroundColor: color }}
              />
              <div className="text-xs">
                <div className="font-medium text-adega-platinum">{name}</div>
                <div className="text-adega-silver">{color}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Variantes de Cards */}
      <section className="space-y-4">
        <h2 className={getTextClasses('subheading')}>Variantes de Cards</h2>
        <div className={gridLayouts.cards}>
          <Card className={cardVariants.default}>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-adega-platinum">
                Card Padrão
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-adega-yellow">Default</div>
              <p className="text-xs text-adega-silver">Card básico</p>
            </CardContent>
          </Card>

          <Card className={cardVariants.interactive}>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-adega-platinum">
                Card Interativo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-adega-yellow">Hover me</div>
              <p className="text-xs text-adega-silver">Com hover effect</p>
            </CardContent>
          </Card>

          <Card className={cardVariants.warning}>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-adega-platinum">
                Card de Aviso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-adega-amber">Warning</div>
              <p className="text-xs text-adega-silver">Estado de atenção</p>
            </CardContent>
          </Card>

          <Card className={cardVariants.success}>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-adega-platinum">
                Card de Sucesso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">Success</div>
              <p className="text-xs text-adega-silver">Estado positivo</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Hierarquia de Texto */}
      <section className="space-y-4">
        <h2 className={getTextClasses('subheading')}>Hierarquia de Texto</h2>
        <Card className={cardVariants.default}>
          <CardContent className="space-y-4 pt-6">
            <div className={getTextClasses('heading')}>
              Heading - Título Principal
            </div>
            <div className={getTextClasses('subheading')}>
              Subheading - Subtítulo
            </div>
            <div className={getTextClasses('primary')}>
              Primary - Texto principal
            </div>
            <div className={getTextClasses('secondary')}>
              Secondary - Texto secundário
            </div>
            <div className={getTextClasses('accent')}>
              Accent - Texto de destaque
            </div>
            <div className={getValueClasses('lg', 'gold')}>
              R$ 1.234,56 - Valor monetário
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Ícones */}
      <section className="space-y-4">
        <h2 className={getTextClasses('subheading')}>Ícones por Contexto</h2>
        <div className={gridLayouts.cards}>
          <Card className={cardVariants.default}>
            <CardContent className="pt-6 space-y-4">
              <div className={flexLayouts.between}>
                <span className={getTextClasses('secondary')}>Primário</span>
                <Users className={getIconClasses('primary', 'medium')} />
              </div>
              <div className={flexLayouts.between}>
                <span className={getTextClasses('secondary')}>Sucesso</span>
                <Check className={getIconClasses('success', 'medium')} />
              </div>
              <div className={flexLayouts.between}>
                <span className={getTextClasses('secondary')}>Aviso</span>
                <AlertTriangle className={getIconClasses('warning', 'medium')} />
              </div>
              <div className={flexLayouts.between}>
                <span className={getTextClasses('secondary')}>Erro</span>
                <X className={getIconClasses('error', 'medium')} />
              </div>
              <div className={flexLayouts.between}>
                <span className={getTextClasses('secondary')}>Premium</span>
                <Star className={getIconClasses('premium', 'medium')} />
              </div>
            </CardContent>
          </Card>

          <Card className={cardVariants.default}>
            <CardContent className="pt-6 space-y-4">
              <div className={flexLayouts.between}>
                <span className={getTextClasses('secondary')}>Small</span>
                <Package className={getIconClasses('primary', 'small')} />
              </div>
              <div className={flexLayouts.between}>
                <span className={getTextClasses('secondary')}>Medium</span>
                <Package className={getIconClasses('primary', 'medium')} />
              </div>
              <div className={flexLayouts.between}>
                <span className={getTextClasses('secondary')}>Large</span>
                <Package className={getIconClasses('primary', 'large')} />
              </div>
              <div className={flexLayouts.between}>
                <span className={getTextClasses('secondary')}>X-Large</span>
                <Package className={getIconClasses('primary', 'xlarge')} />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Badges de Segmento */}
      <section className="space-y-4">
        <h2 className={getTextClasses('subheading')}>Badges de Segmento</h2>
        <Card className={cardVariants.default}>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-2">
              {['VIP', 'Fiel - VIP', 'Regular', 'Ocasional', 'Novo'].map((segment) => (
                <Badge 
                  key={segment}
                  className={getCustomerSegmentClasses(segment)}
                >
                  {segment}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Estados de Estoque */}
      <section className="space-y-4">
        <h2 className={getTextClasses('subheading')}>Estados de Estoque</h2>
        <div className={gridLayouts.cards}>
          {[
            { stock: 5, min: 10, label: 'Crítico' },
            { stock: 8, min: 10, label: 'Baixo' },
            { stock: 15, min: 10, label: 'Adequado' },
            { stock: 50, min: 10, label: 'Alto' }
          ].map(({ stock, min, label }) => {
            const statusClasses = getStockStatusClasses(stock, min);
            return (
              <Card key={label} className={cardVariants.default}>
                <CardContent className="pt-6 text-center">
                  <div className={`text-lg font-bold ${statusClasses.text}`}>
                    {stock}/{min}
                  </div>
                  <Badge className={statusClasses.badge}>
                    {label}
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Giro de Produtos */}
      <section className="space-y-4">
        <h2 className={getTextClasses('subheading')}>Giro de Produtos</h2>
        <div className={gridLayouts.cards}>
          {['fast', 'medium', 'slow'].map((turnover) => {
            const turnoverClasses = getTurnoverClasses(turnover as 'fast' | 'medium' | 'slow');
            return (
              <Card key={turnover} className={cardVariants.default}>
                <CardContent className="pt-6 space-y-2">
                  <div className={flexLayouts.between}>
                    <span className={getTextClasses('secondary')}>Giro</span>
                    <TrendingUp className={`h-4 w-4 ${turnoverClasses.icon}`} />
                  </div>
                  <Badge className={turnoverClasses.badge}>
                    {turnover === 'fast' ? 'Rápido' : 
                     turnover === 'medium' ? 'Médio' : 'Lento'}
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Botões */}
      <section className="space-y-4">
        <h2 className={getTextClasses('subheading')}>Variantes de Botões</h2>
        <Card className={cardVariants.default}>
          <CardContent className="pt-6 space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button className={buttonVariants.primary}>
                Primário
              </Button>
              <Button className={buttonVariants.secondary}>
                Secundário
              </Button>
              <Button className={buttonVariants.ghost}>
                Ghost
              </Button>
              <Button className={buttonVariants.outline}>
                Outline
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Inputs */}
      <section className="space-y-4">
        <h2 className={getTextClasses('subheading')}>Estados de Input</h2>
        <Card className={cardVariants.default}>
          <CardContent className="pt-6 space-y-4">
            <Input 
              placeholder="Input padrão"
              className={inputVariants.default}
            />
            <Input 
              placeholder="Input com erro"
              className={inputVariants.error}
            />
            <Input 
              placeholder="Input com sucesso"
              className={inputVariants.success}
            />
          </CardContent>
        </Card>
      </section>

      {/* Transições */}
      <section className="space-y-4">
        <h2 className={getTextClasses('subheading')}>Efeitos de Transição</h2>
        <div className={gridLayouts.cards}>
          <Card className={`${cardVariants.default} ${transitionClasses.hoverScale}`}>
            <CardContent className="pt-6 text-center">
              <div className={getTextClasses('secondary')}>Hover Scale</div>
            </CardContent>
          </Card>
          
          <Card className={`${cardVariants.default} ${transitionClasses.hoverGlow}`}>
            <CardContent className="pt-6 text-center">
              <div className={getTextClasses('secondary')}>Hover Glow</div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <div className="text-center pt-8 border-t border-white/10">
        <p className={getTextClasses('caption')}>
          Sistema de Temas Adega v1.0 - Baseado em análise de 925+ registros em produção
        </p>
      </div>
    </div>
  );
};