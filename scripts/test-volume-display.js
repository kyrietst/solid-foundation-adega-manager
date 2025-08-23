/**
 * Script para testar se os volumes estão sendo exibidos corretamente
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uujkzvbgnfzuzlztrzln.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1amt6dmJnbmZ6dXpsenRyemxuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODQ2OTkzNSwiZXhwIjoyMDY0MDQ1OTM1fQ.Bz2Fd284THGPmZ02zv54JMWg8-Wr6rEqt60Ag__D5ww';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('🧪 Testando exibição de volumes...');
  
  try {
    // Buscar alguns produtos com volume para testar
    const { data: products } = await supabase
      .from('products')
      .select('name, volume_ml, turnover_rate, category')
      .not('volume_ml', 'is', null)
      .limit(10);
    
    if (products && products.length > 0) {
      console.log('\n📦 Produtos com volume definido:');
      products.forEach(product => {
        // Simular como seria exibido no card
        const volumeDisplay = product.volume_ml ? `${product.volume_ml}ml` : 'N/A';
        const turnoverDisplay = product.turnover_rate === 'fast' ? 'Rápido' : 
                               product.turnover_rate === 'slow' ? 'Devagar' : 'Médio';
        
        console.log(`  ✅ ${product.name}`);
        console.log(`     Volume: ${volumeDisplay}`);
        console.log(`     Giro: ${turnoverDisplay}`);
        console.log(`     Categoria: ${product.category}`);
        console.log('');
      });
    }
    
    // Verificar produtos sem volume
    const { count: noVolumeCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .is('volume_ml', null);
    
    console.log(`📊 Produtos sem volume: ${noVolumeCount}`);
    
    // Estatísticas de volume
    const { data: volumeStats } = await supabase
      .from('products')
      .select('volume_ml')
      .not('volume_ml', 'is', null);
    
    if (volumeStats) {
      const volumes = volumeStats.map(p => p.volume_ml).sort((a, b) => a - b);
      const minVolume = Math.min(...volumes);
      const maxVolume = Math.max(...volumes);
      const avgVolume = volumes.reduce((sum, vol) => sum + vol, 0) / volumes.length;
      
      console.log(`📈 Estatísticas de volume:`);
      console.log(`   Menor: ${minVolume}ml`);
      console.log(`   Maior: ${maxVolume}ml`);
      console.log(`   Média: ${avgVolume.toFixed(0)}ml`);
      console.log(`   Total com volume: ${volumes.length} produtos`);
    }
    
    console.log('\n✅ Teste concluído! Os volumes agora devem aparecer corretamente nos cards.');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
}

main();