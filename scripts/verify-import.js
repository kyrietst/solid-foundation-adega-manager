/**
 * Script para verificar se a importação foi bem-sucedida
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uujkzvbgnfzuzlztrzln.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1amt6dmJnbmZ6dXpsenRyemxuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODQ2OTkzNSwiZXhwIjoyMDY0MDQ1OTM1fQ.Bz2Fd284THGPmZ02zv54JMWg8-Wr6rEqt60Ag__D5ww';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('🔍 Verificando importação...');
  
  try {
    // Contar total de produtos
    const { count: totalProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    console.log(`📊 Total de produtos: ${totalProducts}`);
    
    // Contar por categoria
    const { data: categoryCounts } = await supabase
      .from('products')
      .select('category')
      .not('category', 'is', null);
    
    const categoryStats = {};
    categoryCounts?.forEach(product => {
      categoryStats[product.category] = (categoryStats[product.category] || 0) + 1;
    });
    
    console.log('\n📂 Produtos por categoria:');
    Object.entries(categoryStats)
      .sort(([,a], [,b]) => b - a)
      .forEach(([category, count]) => {
        console.log(`  ${category}: ${count} produtos`);
      });
    
    // Exemplos de produtos específicos do CSV
    const testProducts = [
      'Brahma ZERO',
      'Heineken - Long Neck',
      'Coca Cola',
      'Whisky Jack Daniel\'s Old No. 7'
    ];
    
    console.log('\n🎯 Verificando produtos específicos:');
    
    for (const productName of testProducts) {
      const { data: products } = await supabase
        .from('products')
        .select('name, category, price, stock_quantity, supplier, volume_ml, turnover_rate')
        .ilike('name', `%${productName.replace(/'/g, '')}%`)
        .limit(1);
      
      if (products && products.length > 0) {
        const p = products[0];
        console.log(`  ✅ ${p.name}`);
        console.log(`     Categoria: ${p.category}, Preço: R$ ${p.price}, Estoque: ${p.stock_quantity}`);
        console.log(`     Fornecedor: ${p.supplier || 'N/A'}, Volume: ${p.volume_ml ? p.volume_ml + 'ml' : 'N/A'}`);
      } else {
        console.log(`  ❌ ${productName} - Não encontrado`);
      }
    }
    
    // Verificar conversões específicas
    console.log('\n🧮 Verificando conversões complexas:');
    
    // Brahma ZERO - "8pc + 9un" com package_size 12 = (8×12) + 9 = 105
    const { data: brahmaZero } = await supabase
      .from('products')
      .select('*')
      .ilike('name', '%Brahma ZERO%')
      .limit(1);
    
    if (brahmaZero && brahmaZero.length > 0) {
      const p = brahmaZero[0];
      console.log(`  📦 ${p.name}:`);
      console.log(`     Estoque calculado: ${p.stock_quantity} (esperado: 105 de "8pc + 9un")`);
      console.log(`     Package size: ${p.package_size}, Is package: ${p.is_package}`);
      console.log(`     Preço unitário: R$ ${p.price}, Preço pacote: R$ ${p.package_price || 'N/A'}`);
    }
    
    // Estatísticas gerais
    const { data: stats } = await supabase
      .from('products')
      .select('price, stock_quantity, volume_ml, turnover_rate');
    
    if (stats) {
      const totalValue = stats.reduce((sum, p) => sum + (p.price || 0) * (p.stock_quantity || 0), 0);
      const avgPrice = stats.filter(p => p.price).reduce((sum, p) => sum + p.price, 0) / stats.filter(p => p.price).length;
      const totalStock = stats.reduce((sum, p) => sum + (p.stock_quantity || 0), 0);
      
      const turnoverCounts = {
        fast: stats.filter(p => p.turnover_rate === 'fast').length,
        medium: stats.filter(p => p.turnover_rate === 'medium').length,
        slow: stats.filter(p => p.turnover_rate === 'slow').length
      };
      
      console.log('\n📈 Estatísticas gerais:');
      console.log(`  💰 Valor total do estoque: R$ ${totalValue.toFixed(2)}`);
      console.log(`  🏷️ Preço médio: R$ ${avgPrice.toFixed(2)}`);
      console.log(`  📦 Estoque total: ${totalStock} unidades`);
      console.log(`  🔄 Giro: ${turnoverCounts.fast} rápido, ${turnoverCounts.medium} médio, ${turnoverCounts.slow} devagar`);
    }
    
    console.log('\n✅ Verificação concluída!');
    
  } catch (error) {
    console.error('❌ Erro durante verificação:', error);
  }
}

main();