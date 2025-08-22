# Estrutura de Colunas - Tabela Products

## Colunas Obrigatórias (NOT NULL)

- **name** (text) - Nome do produto
- **price** (numeric) - Preço de venda
- **stock_quantity** (integer) - Quantidade em estoque (padrão: 0)
- **category** (text) - Categoria do produto
- **minimum_stock** (integer) - Estoque mínimo (padrão: 5)

## Colunas Opcionais (NULLABLE)

### Informações Básicas
- **description** (text) - Descrição do produto
- **image_url** (text) - URL da imagem

### Informações de Vinho
- **vintage** (integer) - Ano/safra
- **producer** (text) - Produtor
- **country** (text) - País de origem
- **region** (text) - Região
- **alcohol_content** (numeric) - Teor alcoólico

### Volume e Medidas
- **volume** (integer) - Volume legacy (mantido como null)
- **volume_ml** (integer) - Volume em mililitros
- **measurement_type** (text) - Tipo de medição
- **measurement_value** (text) - Valor da medição

### Fornecedor e Custos
- **supplier** (text) - Fornecedor
- **cost_price** (numeric) - Preço de custo
- **margin_percent** (numeric) - Percentual de margem

### Embalagem e Unidades
- **unit_type** (text) - Tipo de unidade (padrão: 'un')
- **package_size** (integer) - Tamanho do pacote (padrão: 1)
- **package_price** (numeric) - Preço do pacote
- **package_margin** (numeric) - Margem do pacote
- **is_package** (boolean) - É um pacote (padrão: false)
- **units_per_package** (integer) - Unidades por pacote (padrão: 1)
- **packaging_type** (varchar) - Tipo de embalagem (padrão: 'fardo')
- **package_units** (integer) - Unidades do pacote

### Códigos de Barras
- **barcode** (varchar 50) - Código de barras principal
- **package_barcode** (varchar 50) - Código de barras do pacote
- **unit_barcode** (varchar 50) - Código de barras da unidade

### Controle e Rastreamento
- **turnover_rate** (text) - Taxa de giro (padrão: 'medium')
- **last_sale_date** (timestamp) - Data da última venda
- **has_package_tracking** (boolean) - Tem rastreamento de pacote (padrão: false)
- **has_unit_tracking** (boolean) - Tem rastreamento de unidade (padrão: false)

## Colunas do Sistema (Geradas Automaticamente)

- **id** (uuid) - ID único (auto-gerado)
- **created_at** (timestamp) - Data de criação (auto)
- **updated_at** (timestamp) - Data de atualização (auto)

## Resumo para Mapeamento

**Campos Essenciais:** name, price, stock_quantity, category, minimum_stock
**Campos de Negócio:** vintage, producer, country, region, alcohol_content, volume_ml
**Campos Financeiros:** cost_price, margin_percent, supplier
**Campos de Embalagem:** package_size, package_price, is_package, units_per_package
**Campos de Código:** barcode, package_barcode, unit_barcode