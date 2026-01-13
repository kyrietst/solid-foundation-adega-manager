import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://uujkzvbgnfzuzlztrzln.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1amt6dmJnbmZ6dXpsenRyemxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0Njk5MzUsImV4cCI6MjA2NDA0NTkzNX0.8G-ur4VH69Bk4q71k3YlA-u6d2mWAv6tMWBb7-nsLak';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const PROJECT_REF = 'uujkzvbgnfzuzlztrzln';
const FUNCTION_URL = `https://${PROJECT_REF}.supabase.co/functions/v1/fiscal-handler`;

async function main() {
  try {
    console.log('--- Starting Real NFC-e Emission Test ---');

    // 1. Data Params
    const PRODUCT_ID = '2142aa88-a21f-4835-a562-70edaeb3b8e9'; // Heineken Zero
    const USER_ID = '917ada3a-b637-42c2-b59c-5f7e9685e961';
    const SALE_TOTAL = 7.00;
    
    // 2. Insert Sale Header
    console.log('1. Inserting Sale Header...');
    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .insert({
        user_id: USER_ID,
        total_amount: SALE_TOTAL,
        final_amount: SALE_TOTAL,
        discount_amount: 0,
        payment_method_enum: 'money',
        payment_method: 'money', 
        status: 'completed',
        payment_status: 'completed', // RESTORED
        is_delivery: false
      })
      .select()
      .single();

    if (saleError) {
      console.error('Sale Insert Error:', JSON.stringify(saleError, null, 2));
      return;
    }
    const SALE_ID = sale.id;
    console.log(`   Sale ID Created: ${SALE_ID}`);

    // 3. Insert Sale Item
    console.log('2. Inserting Sale Item...');
    const { error: itemError } = await supabase
      .from('sale_items')
      .insert({
        sale_id: SALE_ID,
        product_id: PRODUCT_ID,
        quantity: 1,
        unit_price: SALE_TOTAL,
        total_price: SALE_TOTAL
      });

    if (itemError) {
      console.error('Item Insert Error:', JSON.stringify(itemError, null, 2));
      return;
    }

    // 4. Insert Payment 
    console.log('3. Inserting Sale Payment...');
    const { error: payError } = await supabase
      .from('sale_payments')
      .insert({
        sale_id: SALE_ID,
        payment_method_id: null, 
        amount: SALE_TOTAL,
        installments: 1
      });
    
    if (payError) {
        console.warn('Payment Insert Warning:', JSON.stringify(payError, null, 2)); 
    }

    // 5. Invoke Fiscal Handler
    console.log(`4. Invoking Fiscal Handler for ${SALE_ID}...`);
    // ... invoke logic ...
    const res = await fetch(FUNCTION_URL, {
        method: 'POST',
        headers: {
        'Authorization': `Bearer ${SUPABASE_KEY}`, 
        'Content-Type': 'application/json'
        },
        body: JSON.stringify({
        sale_id: SALE_ID,
        cpfNaNota: null 
        })
    });

    const text = await res.text();
    console.log('--- Response ---');
    console.log(`Status: ${res.status}`);
    console.log('Body:', text);

    if (res.ok) {
        console.log('✅ SUCCESS! Invoice Authorized.');
    } else {
        console.log('❌ FAILURE. Invoice Rejected.');
    }

  } catch (err) {
      console.error('CRITICAL SCRIPT ERROR:', err);
  }
}

main();
