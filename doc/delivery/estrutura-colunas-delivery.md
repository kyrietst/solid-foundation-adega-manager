# Estrutura das Colunas - Sistema de Delivery

## Análise das Tabelas Existentes no Banco de Dados

### Tabela `sales` (Vendas com Delivery)
| Campo | Tipo | Obrigatório | Padrão | Descrição |
|-------|------|-------------|---------|-----------|
| id | uuid | Sim | uuid_generate_v4() | ID único da venda |
| customer_id | uuid | Não | null | ID do cliente |
| user_id | uuid | Sim | - | ID do usuário que criou a venda |
| total_amount | numeric | Sim | 0 | Valor total dos produtos |
| payment_method | text | Sim | - | Método de pagamento |
| status | text | Sim | 'pending' | Status geral da venda |
| delivery | boolean | Não | false | **OBSOLETO**: Se é delivery |
| delivery_type | varchar | Não | 'presencial' | Tipo: 'delivery' ou 'presencial' |
| delivery_address | jsonb | Não | null | Endereço de entrega (JSON) |
| delivery_fee | numeric | Não | 0.00 | Taxa de entrega |
| delivery_status | varchar | Não | 'pending' | Status específico do delivery |
| delivery_person_id | uuid | Não | null | ID do entregador |
| delivery_zone_id | uuid | Não | null | ID da zona de entrega |
| delivery_instructions | text | Não | null | Instruções especiais |
| estimated_delivery_time | timestamptz | Não | null | Tempo estimado de entrega |
| delivery_started_at | timestamptz | Não | null | Momento que iniciou a entrega |
| delivery_completed_at | timestamptz | Não | null | Momento que completou a entrega |
| seller_id | uuid | Não | null | ID do vendedor |
| discount_amount | numeric | Sim | 0 | Valor do desconto |
| final_amount | numeric | Sim | 0 | Valor final (total + taxa - desconto) |
| payment_status | text | Sim | 'pending' | Status do pagamento |
| notes | text | Não | null | Observações gerais |
| created_at | timestamptz | Sim | now() | Data/hora de criação |
| updated_at | timestamptz | Sim | now() | Data/hora de atualização |

### Tabela `sale_items` (Itens da Venda)
| Campo | Tipo | Obrigatório | Padrão | Descrição |
|-------|------|-------------|---------|-----------|
| id | uuid | Sim | uuid_generate_v4() | ID único do item |
| sale_id | uuid | Sim | - | ID da venda (FK) |
| product_id | uuid | Sim | - | ID do produto (FK) |
| quantity | integer | Sim | - | Quantidade do produto |
| unit_price | numeric | Sim | - | Preço unitário no momento da venda |
| created_at | timestamptz | Sim | now() | Data/hora de criação |

### Tabela `delivery_tracking` (Rastreamento de Entrega)
| Campo | Tipo | Obrigatório | Padrão | Descrição |
|-------|------|-------------|---------|-----------|
| id | uuid | Sim | gen_random_uuid() | ID único do tracking |
| sale_id | uuid | Sim | - | ID da venda (FK) |
| status | varchar | Sim | - | Status da entrega neste momento |
| location_lat | numeric | Não | null | Latitude (GPS) |
| location_lng | numeric | Não | null | Longitude (GPS) |
| notes | text | Não | null | Observações do status |
| created_by | uuid | Não | null | Usuário que criou o registro |
| created_at | timestamptz | Não | now() | Data/hora do evento |
| updated_at | timestamptz | Não | now() | Data/hora de atualização |

### Tabela `delivery_zones` (Zonas de Entrega)
| Campo | Tipo | Obrigatório | Padrão | Descrição |
|-------|------|-------------|---------|-----------|
| id | uuid | Sim | gen_random_uuid() | ID único da zona |
| name | varchar | Sim | - | Nome da zona |
| description | text | Não | null | Descrição da zona |
| polygon | jsonb | Sim | - | Polígono geográfico (GeoJSON) |
| delivery_fee | numeric | Sim | 0.00 | Taxa de entrega padrão |
| estimated_time_minutes | integer | Sim | 30 | Tempo estimado em minutos |
| minimum_order_value | numeric | Não | 0.00 | Valor mínimo do pedido |
| is_active | boolean | Não | true | Se a zona está ativa |
| color_hex | varchar | Não | '#3B82F6' | Cor para exibição no mapa |
| priority | integer | Não | 1 | Prioridade da zona |
| created_at | timestamptz | Não | now() | Data/hora de criação |
| updated_at | timestamptz | Não | now() | Data/hora de atualização |

## Estrutura das Colunas do CSV Analisado

### Arquivo: `Controle Delivery - Adega Anita's - PEDIDOS DELIVERY.csv`

| Coluna | Tipo Deduzido | Exemplo | Observações |
|--------|---------------|---------|-------------|
| Nº Pedido | Número sequencial | "1", "2", "91" | Numeração manual, pode ter lacunas |
| Data/Hora | DateTime | "10/7/2025 18:49" | Formato dd/MM/yyyy HH:mm |
| Nome Cliente | String | "Alessandro", "Andressa" | Nomes dos clientes |
| Telefone | String | "11 94819-1219" | Formato padrão brasileiro |
| Endereço | String | "Rua José Cardoso Siqueira 205" | Endereço completo em texto livre |
| Produtos | String (Lista) | "1pc spaten 350ml", "10un Heineken 600ml" | Lista de produtos separados por vírgula |
| Valor Total | Currency | "R$ 55.00", "R$ 100.00" | Valor em formato monetário brasileiro |
| Taxa de Entrega | Currency | "R$ 7.00", "R$ 10.00" | Taxa de entrega em formato monetário |
| Forma Pagamento | String | "Dinheiro", "Cartão", "PIX" | Método de pagamento |
| Status | String | "Entregue" | Status da entrega (todos "Entregue" no arquivo) |
| Entregador | String | "Victor" | Nome do entregador (maioria "Victor") |

## Padrões Identificados no CSV

### Formatos de Produtos
- **Cerveja em lata**: "1pc spaten 350ml", "1pc Heineken 269ml"
- **Cerveja em garrafa**: "10un Heineken 600ml", "12un Heineken 600ml"
- **Caixas**: "1cx original litrão", "1cx Skol 300ml"
- **Pacotes**: "1pc original 269ml c/15" (com 15 unidades)
- **Cigarros**: "1 maço rothmans azul normal", "1 maço calton"
- **Bebidas**: "1un coca lata", "1un coca 2L", "2un coca retornável 2L"
- **Outros**: "1un catuaba", "1 dose maria mole", "1 saco de gelo"

### Formatos de Endereço
- **Padrão básico**: "Rua Nome da Rua número"
- **Com complemento**: "Rua Nome 131, apartamento 10"
- **Com referência**: "Bar do Rock 334" (cliente frequente)
- **Detalhado**: "Avenida Dom Pedro de Alcântara 755 Grotão do lado da mina de água Bar da Neide"

### Valores Monetários
- **Valor Total**: Varia de R$ 9,25 a R$ 410,00
- **Taxa de Entrega**: Varia de R$ 5,00 a R$ 16,00
- **Padrão**: Valores sempre com 2 casas decimais

### Padrões Temporais
- **Período**: Julho/2025 a Agosto/2025
- **Horários**: Principalmente entre 13:00 e 23:59
- **Picos**: Maior movimento entre 18:00 e 22:00

### Status de Entrega
- **Status único**: Todos os pedidos estão marcados como "Entregue"
- **Entregador principal**: "Victor" é responsável por ~95% das entregas
- **Alguns registros**: Não têm entregador especificado

## Inconsistências Encontradas

1. **Numeração**: Alguns registros não têm número de pedido
2. **Entregadores**: Algumas entregas sem entregador especificado
3. **Formato de data**: Uma data com ano 2005 (provavelmente erro de digitação)
4. **Campos vazios**: Algumas linhas com campos em branco
5. **Status limitado**: Apenas "Entregue" registrado (não há pendentes, cancelados, etc.)

## Recomendações

1. **Padronização de produtos**: Criar catálogo estruturado
2. **Geolocalização**: Estruturar endereços para integração com mapas
3. **Status workflow**: Implementar fluxo completo (pendente → preparando → saindo → entregue)
4. **Tracking temporal**: Registrar timestamps para cada mudança de status
5. **Validação de dados**: Implementar validações para evitar inconsistências