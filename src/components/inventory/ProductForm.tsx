import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calculator, Package, DollarSign, TrendingUp } from 'lucide-react';
import { ProductFormData, UnitType } from '@/types/inventory.types';
import { useInventoryCalculations } from '@/hooks/useInventoryCalculations';
import { BarcodeInput } from '@/components/inventory/BarcodeInput';
import { useBarcode } from '@/hooks/use-barcode';

interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  isEdit?: boolean;
}

const CATEGORIES = [
  'Vinho Tinto',
  'Vinho Branco',
  'Vinho Rosé',
  'Espumante',
  'Champagne',
  'Whisky',
  'Vodka',
  'Gin',
  'Rum',
  'Cachaça',
  'Cerveja',
  'Outros'
];

export const ProductForm: React.FC<ProductFormProps> = ({
  initialData = {},
  onSubmit,
  onCancel,
  isLoading = false,
  isEdit = false
}) => {
  const [formData, setFormData] = useState<Partial<ProductFormData>>({
    name: '',
    description: '',
    category: '',
    price: 0,
    cost_price: 0,
    margin_percent: 0,
    stock_quantity: 0,
    minimum_stock: 5,
    supplier: '',
    producer: '',
    country: '',
    region: '',
    vintage: undefined,
    alcohol_content: undefined,
    volume_ml: undefined,
    image_url: '',
    unit_type: 'un',
    package_size: 1,
    package_price: undefined,
    package_margin: undefined,
    barcode: '',
    ...initialData
  });

  const { calculations, calculatePriceWithMargin, validateProductData } = useInventoryCalculations(formData);
  const { validateBarcode } = useBarcode();
  const validation = validateProductData(formData);

  // Atualizar preço por pacote automaticamente quando necessário
  useEffect(() => {
    if (formData.price && formData.package_size && !formData.package_price) {
      setFormData(prev => ({
        ...prev,
        package_price: (prev.price || 0) * (prev.package_size || 1)
      }));
    }
  }, [formData.price, formData.package_size, formData.package_price]);

  const handleInputChange = (field: keyof ProductFormData, value: string | number | UnitType) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validation.isValid) {
      onSubmit(formData as ProductFormData);
    }
  };

  const handleBarcodeScanned = async (barcode: string) => {
    const validation = validateBarcode(barcode);
    if (validation.isValid) {
      setFormData(prev => ({ ...prev, barcode }));
    }
  };

  const handleMarginChange = (margin: number) => {
    if (formData.cost_price) {
      const newPrice = calculatePriceWithMargin(formData.cost_price, margin);
      setFormData(prev => ({
        ...prev,
        margin_percent: margin,
        price: newPrice
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informações Básicas */}
      <Card className="bg-adega-charcoal/20 border-white/10 backdrop-blur-xl shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Informações Básicas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome do Produto *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Ex: Vinho Tinto Cabernet Sauvignon"
                required
              />
            </div>

            <div>
              <Label htmlFor="category">Categoria *</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="volume_ml">Volume (ml)</Label>
              <Input
                id="volume_ml"
                type="number"
                value={formData.volume_ml || ''}
                onChange={(e) => handleInputChange('volume_ml', Number(e.target.value))}
                placeholder="750"
              />
            </div>

            <div>
              <BarcodeInput
                onScan={handleBarcodeScanned}
                placeholder="Escaneie ou digite o código de barras"
                autoFocus={false}
              />
              {formData.barcode && (
                <Input
                  value={formData.barcode}
                  onChange={(e) => handleInputChange('barcode', e.target.value.replace(/\D/g, ''))}
                  placeholder="Código de barras"
                  maxLength={14}
                  className="mt-2 font-mono"
                />
              )}
            </div>

            <div>
              <Label htmlFor="unit_type">Venda em</Label>
              <Select value={formData.unit_type} onValueChange={(value: UnitType) => handleInputChange('unit_type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="un">Unidade</SelectItem>
                  <SelectItem value="pct">Pacote</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Descrição detalhada do produto..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Preços e Margens */}
      <Card className="bg-adega-charcoal/20 border-white/10 backdrop-blur-xl shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Preços e Margens
          </CardTitle>
          <CardDescription>
            Configure os preços de custo e venda. Os cálculos de margem são automáticos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="cost_price">Preço de Custo (un.)</Label>
              <Input
                id="cost_price"
                type="number"
                step="0.01"
                value={formData.cost_price || ''}
                onChange={(e) => handleInputChange('cost_price', Number(e.target.value))}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="price">Preço de Venda (un.) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleInputChange('price', Number(e.target.value))}
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <Label htmlFor="margin_percent">Margem (%) ou</Label>
              <Input
                id="margin_percent"
                type="number"
                step="0.01"
                value={formData.margin_percent || ''}
                onChange={(e) => handleMarginChange(Number(e.target.value))}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Informações de Pacote */}
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="package_size">Unidades por Pacote</Label>
              <Input
                id="package_size"
                type="number"
                value={formData.package_size}
                onChange={(e) => handleInputChange('package_size', Number(e.target.value))}
                min="1"
              />
            </div>

            <div>
              <Label htmlFor="package_price">Preço de Venda (pct)</Label>
              <Input
                id="package_price"
                type="number"
                step="0.01"
                value={formData.package_price || ''}
                onChange={(e) => handleInputChange('package_price', Number(e.target.value))}
                placeholder={`${calculations.pricePerPackage?.toFixed(2) || '0.00'} (automático)`}
              />
            </div>

            <div>
              <Label>Margem (pct)</Label>
              <div className="flex items-center h-10 px-3 rounded-md border bg-muted">
                <Badge variant="secondary">
                  {calculations.packageMargin?.toFixed(2) || '0.00'}%
                </Badge>
              </div>
            </div>
          </div>

          {/* Cálculos Automáticos */}
          {(calculations.unitMargin !== undefined || calculations.packageMargin !== undefined) && (
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="h-4 w-4" />
                <span className="font-medium">Cálculos Automáticos</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Lucro por unidade:</span>
                  <span className="ml-2 font-medium">R$ {calculations.unitProfitAmount?.toFixed(2) || '0.00'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Lucro por pacote:</span>
                  <span className="ml-2 font-medium">R$ {calculations.packageProfitAmount?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estoque */}
      <Card className="bg-adega-charcoal/20 border-white/10 backdrop-blur-xl shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Controle de Estoque
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="stock_quantity">Estoque Atual *</Label>
              <Input
                id="stock_quantity"
                type="number"
                value={formData.stock_quantity}
                onChange={(e) => handleInputChange('stock_quantity', Number(e.target.value))}
                min="0"
                required
              />
            </div>

            <div>
              <Label htmlFor="minimum_stock">Estoque Mínimo *</Label>
              <Input
                id="minimum_stock"
                type="number"
                value={formData.minimum_stock}
                onChange={(e) => handleInputChange('minimum_stock', Number(e.target.value))}
                min="0"
                required
              />
            </div>

            <div>
              <Label htmlFor="supplier">Fornecedor</Label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) => handleInputChange('supplier', e.target.value)}
                placeholder="Nome do fornecedor"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações Adicionais */}
      <Card className="bg-adega-charcoal/20 border-white/10 backdrop-blur-xl shadow-xl">
        <CardHeader>
          <CardTitle>Informações Adicionais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="producer">Produtor</Label>
              <Input
                id="producer"
                value={formData.producer}
                onChange={(e) => handleInputChange('producer', e.target.value)}
                placeholder="Nome do produtor"
              />
            </div>

            <div>
              <Label htmlFor="country">País</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                placeholder="Brasil"
              />
            </div>

            <div>
              <Label htmlFor="region">Região</Label>
              <Input
                id="region"
                value={formData.region}
                onChange={(e) => handleInputChange('region', e.target.value)}
                placeholder="Vale dos Vinhedos"
              />
            </div>

            <div>
              <Label htmlFor="vintage">Safra</Label>
              <Input
                id="vintage"
                type="number"
                value={formData.vintage || ''}
                onChange={(e) => handleInputChange('vintage', Number(e.target.value))}
                placeholder="2023"
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>

            <div>
              <Label htmlFor="alcohol_content">Teor Alcoólico (%)</Label>
              <Input
                id="alcohol_content"
                type="number"
                step="0.1"
                value={formData.alcohol_content || ''}
                onChange={(e) => handleInputChange('alcohol_content', Number(e.target.value))}
                placeholder="13.5"
                min="0"
                max="100"
              />
            </div>

            <div>
              <Label htmlFor="image_url">URL da Imagem</Label>
              <Input
                id="image_url"
                value={formData.image_url}
                onChange={(e) => handleInputChange('image_url', e.target.value)}
                placeholder="https://exemplo.com/imagem.jpg"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Erros de Validação */}
      {!validation.isValid && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-destructive text-sm">
              <strong>Corrija os seguintes erros:</strong>
              <ul className="list-disc list-inside mt-2">
                {validation.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botões de Ação */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading || !validation.isValid}
          className="min-w-[120px]"
        >
          {isLoading ? 'Salvando...' : (isEdit ? 'Atualizar' : 'Criar')} Produto
        </Button>
      </div>
    </form>
  );
};