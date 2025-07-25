import fs from 'fs'

// Read the products JSON file
const productsData = JSON.parse(fs.readFileSync('./doc/prod/produtos.json', 'utf8'))

// Function to parse volume string to number (ml)
function parseVolume(volumeStr) {
  if (!volumeStr || volumeStr === 'Indisponivel') return null
  
  const volume = volumeStr.toLowerCase()
  
  if (volume.includes('ml')) {
    return parseInt(volume.replace('ml', ''))
  }
  if (volume.includes('l')) {
    const value = parseFloat(volume.replace('l', ''))
    return Math.round(value * 1000) // Convert to ml
  }
  if (volume.includes('kg')) {
    const value = parseFloat(volume.replace('kg', ''))
    return Math.round(value * 1000) // Assume 1kg = 1000ml for liquids
  }
  
  return null
}

// Function to parse price string to number
function parsePrice(priceStr) {
  if (!priceStr || priceStr === 'Indisponível') return null
  
  return parseFloat(priceStr.replace('R$', '').replace(',', '.'))
}

// Function to parse margin percentage
function parseMargin(marginStr) {
  if (!marginStr || marginStr === 'Indisponível') return null
  
  const margin = parseFloat(marginStr)
  return isNaN(margin) ? null : margin
}

// Function to normalize category
function normalizeCategory(category) {
  if (!category || category === 'Indisponível') return 'Outros'
  
  const categoryMap = {
    'Cerveja': 'Cerveja',
    'Bebidas Quentes': 'Destilados',
    'Espumante': 'Espumante',
    'Gin': 'Gin',
    'Licor': 'Licor',
    'Refrigerante': 'Refrigerante',
    'Indisponível': 'Outros'
  }
  
  return categoryMap[category] || 'Outros'
}

// Transform products data to match database schema
const transformedProducts = productsData.map(product => {
  const volumeMl = parseVolume(product.Volume)
  const price = parsePrice(product.Preço)
  const margin = parseMargin(product.Preco_Venda_Atual_pct)
  const category = normalizeCategory(product.Categoria)
  
  return {
    name: product.Produto,
    price: price || 0,
    stock_quantity: 0, // Will be set manually later
    category: category,
    volume_ml: volumeMl,
    margin_percent: margin,
    minimum_stock: 5, // Default minimum stock
    unit_type: 'un', // Default unit type
    package_size: 1, // Default package size
    turnover_rate: 'medium' // Default turnover rate
  }
}).filter(product => product.price > 0) // Filter out products with invalid prices

// Generate SQL INSERT statements
console.log('-- SQL INSERT statements for products table')
console.log('-- Copy and paste these into your Supabase SQL editor')
console.log('')

transformedProducts.forEach(product => {
  const values = [
    `'${product.name.replace(/'/g, "''")}'`, // Escape single quotes
    product.price,
    product.stock_quantity,
    `'${product.category}'`,
    product.volume_ml || 'NULL',
    product.margin_percent || 'NULL',
    product.minimum_stock,
    `'${product.unit_type}'`,
    product.package_size,
    `'${product.turnover_rate}'`
  ].join(', ')
  
  console.log(`INSERT INTO products (name, price, stock_quantity, category, volume_ml, margin_percent, minimum_stock, unit_type, package_size, turnover_rate) VALUES (${values});`)
})

console.log('')
console.log(`-- Total products to insert: ${transformedProducts.length}`)