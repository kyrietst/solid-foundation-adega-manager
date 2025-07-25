import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import dotenv from 'dotenv'

// Load environment variables from .env file
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

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

console.log(`Preparing to insert ${transformedProducts.length} products...`)

// Insert products into database
async function insertProducts() {
  try {
    console.log('Starting product insertion...')
    
    // Insert products in batches of 50 to avoid hitting rate limits
    const batchSize = 50
    let inserted = 0
    
    for (let i = 0; i < transformedProducts.length; i += batchSize) {
      const batch = transformedProducts.slice(i, i + batchSize)
      
      const { data, error } = await supabase
        .from('products')
        .insert(batch)
        .select()
      
      if (error) {
        console.error('Error inserting batch:', error)
        console.error('Batch data:', batch)
        continue
      }
      
      inserted += data.length
      console.log(`Inserted ${inserted}/${transformedProducts.length} products`)
    }
    
    console.log(`Successfully inserted ${inserted} products!`)
    
  } catch (error) {
    console.error('Error during insertion:', error)
  }
}

// Run the insertion
insertProducts()