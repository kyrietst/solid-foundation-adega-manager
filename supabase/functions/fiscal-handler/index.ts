// deno-lint-ignore-file no-explicit-any
import { createClient } from '@supabase/supabase-js'
import { corsHeaders } from '../_shared/cors.ts'

console.log("Fiscal Handler v2.3.0 - Dynamic Env")

// Constants
const AUTH_URL = 'https://auth.nuvemfiscal.com.br/oauth/token'

Deno.serve(async (req) => {
  // 1. Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  let sale_id_for_log: string | null = null // Variable to hold sale_id for error logging

  try {
    // 2. Auth Check: Ensure user is signed in
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing Authorization header')
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', details: authError }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 3. Environment & Configuration
    const CLIENT_ID = Deno.env.get('NUVEM_FISCAL_CLIENT_ID')
    const CLIENT_SECRET = Deno.env.get('NUVEM_FISCAL_CLIENT_SECRET')

    if (!CLIENT_ID || !CLIENT_SECRET) {
      throw new Error('Fiscal Credentials missing (NUVEM_FISCAL_CLIENT_ID or NUVEM_FISCAL_CLIENT_SECRET)')
    }

    // 4. Parse Request
    const { sale_id } = await req.json()
    sale_id_for_log = sale_id // Capture ID for global error logging
    if (!sale_id) {
       throw new Error('Missing sale_id in request body')
    }

    console.log(`[Fiscal] Starting emission for Sale ID: ${sale_id}`)

    // 5. Data Fetching (Parallel)
    const [saleResponse, settingsResponse] = await Promise.all([
      supabaseClient
        .from('sales')
        .select(`
          *,
          payment_methods (
            code
          ),
          sale_items (
            *,
            fiscal_snapshot,
            products (
              name,
              barcode,
              ncm,
              cest,
              cfop,
              origin
            )
          ),
            customers (
            name,
            email,
            phone,
            address,
            cpf_cnpj,
            ie,
            indicador_ie
          )
        `)
        .eq('id', sale_id)
        .single(),

      supabaseClient
        .from('store_settings')
        .select('*')
        .limit(1)
        .single()
    ])

    if (saleResponse.error) throw new Error(`Sale fetch failed: ${saleResponse.error.message}`)
    if (settingsResponse.error) throw new Error(`Settings fetch failed: ${settingsResponse.error.message}`)

    const sale = saleResponse.data
    const settings = settingsResponse.data

    // 6. Config Environment Logic (Dynamic)
    const envSetting = settings.environment?.toLowerCase() || 'development';
    const isProduction = envSetting === 'production';
    
    // API URL & Payload Constants
    const BASE_API_URL = isProduction 
        ? 'https://api.nuvemfiscal.com.br' 
        : 'https://api.sandbox.nuvemfiscal.com.br';
        
    const ENV_PAYLOAD = isProduction ? 'producao' : 'homologacao';
    const TP_AMB = isProduction ? 1 : 2; // 1=Produção, 2=Homologação

    console.log(`[Fiscal] Environment: ${envSetting} -> Target: ${ENV_PAYLOAD} (${BASE_API_URL})`);

    // 7. Validation
    if (!settings.cnpj || !settings.address_street || !settings.address_number) {
       // Validate essential Issuer data
       throw new Error('Dados da Loja incompletos em store_settings (CNPJ ou Endereço faltantes).')
    }

    // 8. Get Nuvem Fiscal Token
    const authDesc = `Client Credentials Flow for ${CLIENT_ID?.substring(0, 5)}...`
    console.log(`[Fiscal] Authenticating: ${authDesc}`)
    
    // Auth Helper
    const tokenParams = new URLSearchParams()
    tokenParams.append('grant_type', 'client_credentials')
    tokenParams.append('client_id', CLIENT_ID)
    tokenParams.append('client_secret', CLIENT_SECRET)
    tokenParams.append('scope', 'nfce')

    const authRes = await fetch(AUTH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenParams
    })

    if (!authRes.ok) {
      const errTxt = await authRes.text()
      throw new Error(`Falha na Autenticação Nuvem Fiscal: ${errTxt}`)
    }

    const { access_token } = await authRes.json()
    if (!access_token) throw new Error('Falha ao obter access_token')

    // 9. The Great Mapping (JSON Factory)
    
    // Items Mapping
    const items = sale.sale_items.map((item: any, index: number) => {
        const product = item.products
        const snapshot = item.fiscal_snapshot || {}
        
        if (!product) throw new Error(`Produto não encontrado para item ${item.id}`)

        // Fiscal Data Priorities: Snapshot > Product > Default
        const ncm = snapshot.ncm || product.ncm || '00000000'
        const cfop = snapshot.cfop || product.cfop || '5102'
        const uCom = snapshot.uCom || snapshot.ucom || 'UN'
        const xProd = snapshot.xProd || product.name
        const cest = snapshot.cest || product.cest
        const valorUnitario = parseFloat(item.unit_price)

        return {
            numero_item: index + 1,
            codigo_produto: product.barcode || 'SEM_EQ',
            descricao: xProd,
            cfop: cfop,
            unidade_comercial: uCom,
            quantidade_comercial: item.quantity, // Number
            valor_unitario_comercial: valorUnitario, // Number
            valor_bruto: item.quantity * valorUnitario, // Number
            unidade_tributavel: uCom,
            quantidade_tributavel: item.quantity, // Number
            valor_unitario_tributavel: valorUnitario, // Number
            ncm: ncm,
            cest: cest || undefined,
            impostos: {
                icms: { csosn: '102', origem: product.origin || '0' }
            }
        }
    })

    // Construct Payload
    // Cálculo simples de totais para evitar rejeição
    const totalVenda = items.reduce((acc: number, item: any) => acc + item.valor_bruto, 0)
    const totalVendaNumber = parseFloat(totalVenda.toFixed(2))

    // Calculate Tax Totals (MEI Logic - Simples Nacional)
    // MEI não destaca ICMS (vBC e vICMS = 0)
    const totalBC = 0.00
    const totalICMS = 0.00

    // Lógica Avançada de Pagamento
    // Robust extraction: Handle if payment_methods is array or object
    const pmraw = sale.payment_methods
    const pm = Array.isArray(pmraw) ? pmraw[0] : pmraw
    const tPag = pm?.code || '99'
    
    // DEBUG: Log resolved tPag
    console.log(`[Fiscal] Resolved tPag: ${tPag} (Raw: ${JSON.stringify(pmraw)})`)

    const paymentDet: any = {
        tPag: tPag,
        vPag: totalVendaNumber
    }

    // Regra 1: Se for '99' (Outros), exige descrição (Erro 441)
    if (tPag === '99') {
        paymentDet.xPag = 'Outros'
    }

    // Regra 2: Se for Cartão (03 ou 04), exige grupo 'card' (Erro 391)
    if (tPag === '03' || tPag === '04') {
        paymentDet.card = {
            tpIntegra: 2, // 2 = Não Integrado (Maquininha POS avulsa)
        }
    }

    // Regra 3 (Workaround): PIX (17) -> Tratar como 99 para evitar Erro 391 em Sandbox/Homologação
    // SEFAZ as vezes rejeita 17 pedindo cartão em alguns ambientes.
    if (tPag === '17') {
        paymentDet.tPag = '99'
        paymentDet.xPag = 'Pagamento Instantaneo (Pix)'
    }



    // Destinatário Logic (NEW)
    let dest: any = undefined;
    const customer = sale.customers;

    if (customer && (customer.cpf_cnpj || customer.name)) {
        dest = {};
        
        // Identificação Basic
        if (customer.name) dest.xNome = customer.name.substring(0, 60);
        
        // CPF/CNPJ Logic
        const doc = customer.cpf_cnpj ? customer.cpf_cnpj.replace(/\D/g, '') : null;
        if (doc) {
            if (doc.length === 11) dest.CPF = doc;
            else if (doc.length === 14) dest.CNPJ = doc;
        }

        // IE logic
        if (customer.indicador_ie) dest.indIEDest = customer.indicador_ie;
        if (customer.ie) dest.IE = customer.ie.replace(/\D/g, '');
        if (customer.email) dest.email = customer.email;

        // Endereço Logic
        if (customer.address && typeof customer.address === 'object') {
            const addr = customer.address;
            // Check if it's FiscalAddress (has logradouro)
            if (addr.logradouro) {
                dest.enderDest = {
                    xLgr: addr.logradouro.substring(0, 60),
                    nro: addr.numero || 'S/N',
                    xCpl: addr.complemento ? addr.complemento.substring(0, 60) : undefined,
                    xBairro: addr.bairro.substring(0, 60),
                    cMun: addr.codigo_municipio, // IBGE!
                    xMun: addr.nome_municipio.substring(0, 60),
                    UF: addr.uf,
                    CEP: addr.cep ? addr.cep.replace(/\D/g, '') : undefined,
                    cPais: "1058",
                    xPais: "BRASIL"
                };
            }
        }
    }

    // 10. Construct Payload (SEFAZ Standard)
    const nfcePayload = {
        ambiente: ENV_PAYLOAD, // Dynamic 'producao' | 'homologacao'
        infNFe: {
            versao: "4.00",
            ide: {
                cUF: 35, // SP
                cNF: Math.floor(10000000 + Math.random() * 90000000), // NUMBER
                natOp: "VENDA", // String ok
                mod: 65, // NUMBER
                serie: 1, // NUMBER
                nNF: sale.order_number ? parseInt(sale.order_number) : 1, // NUMBER
                dhEmi: new Date().toISOString(),
                tpNF: 1, // NUMBER
                idDest: 1, // NUMBER
                cMunFG: 3548708, // NUMBER - São Bernardo do Campo (IBGE)
                tpImp: 4, // NUMBER
                tpEmis: 1, // NUMBER
                tpAmb: TP_AMB, // Dynamic (1 or 2)
                finNFe: 1, // NUMBER
                indFinal: 1, // NUMBER
                indPres: 1, // NUMBER
                procEmi: 0, // NUMBER
                verProc: "FiscalHandler v2.3"
            },
            emit: {
                CNPJ: settings.cnpj.replace(/\D/g, ''),
                xNome: settings.business_name.substring(0, 60),
                enderEmit: {
                    xLgr: settings.address_street.substring(0, 60),
                    nro: settings.address_number,
                    xBairro: settings.address_neighborhood.substring(0, 60),
                    cMun: "3548708", // São Bernardo
                    xMun: "Sao Bernardo do Campo",
                    UF: "SP",
                    CEP: settings.address_zip_code.replace(/\D/g, ''),
                    cPais: "1058", // Brasil
                    xPais: "BRASIL"
                },
                IE: settings.ie === 'ISENTO' ? undefined : settings.ie.replace(/\D/g, ''),
                CRT: 4 // NUMBER (Simples Nacional - MEI)
            },
            dest: dest, // Add Dest here (can be undefined for consumer final anonymous)
            det: items.map((item: any, i: number) => ({
                nItem: i + 1,
                prod: {
                    cProd: item.codigo_produto.substring(0, 60),
                    cEAN: "SEM GTIN",
                    xProd: item.descricao.substring(0, 120),
                    NCM: item.ncm, // Deve ser válido (8 dígitos)
                    CFOP: "5102",
                    uCom: "UN",
                    qCom: item.quantidade_comercial, // NUMBER
                    vUnCom: parseFloat(item.valor_unitario_comercial.toFixed(2)), // NUMBER (Double)
                    vProd: parseFloat(item.valor_bruto.toFixed(2)), // NUMBER (Double)
                    cEANTrib: "SEM GTIN",
                    uTrib: "UN",
                    qTrib: item.quantidade_tributavel, // NUMBER
                    vUnTrib: parseFloat(item.valor_unitario_tributavel.toFixed(2)), // NUMBER
                    indTot: 1 // NUMBER (Era string "1")
                },
                imposto: {
                    ICMS: {
                        ICMSSN102: { 
                            orig: parseInt(item.impostos?.icms?.origem || '0'), // NUMBER
                            CSOSN: "102", // Tributada pelo Simples Nacional sem permissão de crédito
                        }
                    },
                    PIS: {
                        PISOutr: { CST: "99", vBC: 0.00, pPIS: 0.00, vPIS: 0.00 } // NUMBERS
                    },
                    COFINS: {
                        COFINSOutr: { CST: "99", vBC: 0.00, pCOFINS: 0.00, vCOFINS: 0.00 } // NUMBERS
                    }
                }
            })),
            total: {
                ICMSTot: {
                    vBC: totalBC,
                    vICMS: totalICMS,
                    vICMSDeson: 0.00,
                    vFCP: 0.00,
                    vBCST: 0.00,
                    vST: 0.00,
                    vFCPST: 0.00,
                    vFCPSTRet: 0.00,
                    vProd: totalVendaNumber, // NUMBER
                    vFrete: 0.00,
                    vSeg: 0.00,
                    vDesc: 0.00,
                    vII: 0.00,
                    vIPI: 0.00,
                    vIPIDevol: 0.00,
                    vPIS: 0.00,
                    vCOFINS: 0.00,
                    vOutro: 0.00,
                    vNF: totalVendaNumber, // NUMBER
                    vTotTrib: 0.00
                }
            },
            transp: { modFrete: 9 }, // NUMBER (Era "9")
            pag: {
                detPag: [ paymentDet ]
            }
        }
    }

    // 11. Process Emission
    console.log(`[Fiscal] Sending payload to ${BASE_API_URL}/nfce`)
    console.log('[Fiscal] Emit Block:', JSON.stringify(nfcePayload.infNFe.emit))
    
    // Use the dynamic BASE_API_URL
    const apiResponse = await fetch(`${BASE_API_URL}/nfce`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(nfcePayload)
    })

    const resText = await apiResponse.text()
    console.log('[Fiscal] Raw Response:', resText)
    
    let apiData
    try {
        apiData = resText ? JSON.parse(resText) : {}
    } catch (e) {
        console.warn('[Fiscal] Non-JSON response received', e)
        apiData = { error: { message: resText } }
    }
    
    // Status Handling (HTTP Error OR Logical Rejection)
    if (!apiResponse.ok || apiData.status === 'rejeitado' || apiData.status === 'erro') {
        const errorDetails = apiData.autorizacao?.motivo_status || apiData.error?.message || 'Erro de Validação SEFAZ'
        const errorMsg = `Emissão Rejeitada: ${errorDetails}`
        console.error('[Fiscal] Error:', errorMsg)

        // --- DUPLICITY RECOVERY (Erro 539) ---
        const isDuplicity = (apiData.error?.code === '539') || (typeof errorDetails === 'string' && errorDetails.includes('Duplicidade'))
        
        if (isDuplicity) {
            console.log('[Fiscal] Detected Duplicity (Erro 539). Attempting Auto-Recovery...')
            // Extract chNFe from message ex: "Rejeição: Duplicidade de NF-e [chNFe:3522...]"
            const match = errorDetails.match(/\[chNFe:(\d+)/) 
            const chNFe = match ? match[1] : null

            if (chNFe) {
                 console.log(`[Fiscal] Recovering Key: ${chNFe}`)
                 try {
                     // Fetch from Nuvem Fiscal by Key (using ID endpoint as proxy or direct if supported)
                     // Nuvem Fiscal often allows /nfce/{key}
                     const recoveryUrl = `${BASE_API_URL}/nfce/${chNFe}`
                     console.log(`[Fiscal] Fetching: ${recoveryUrl}`)
                     
                     const recoveryRes = await fetch(recoveryUrl, {
                         headers: { 
                             'Authorization': `Bearer ${access_token}`,
                             'Content-Type': 'application/json' 
                        }
                     })

                     if (recoveryRes.ok) {
                         const recoveryData = await recoveryRes.json()
                         console.log('[Fiscal] Recovery Success:', recoveryData)

                         // Upsert Log (Recovered)
                         await supabaseClient
                           .from('invoice_logs')
                           .upsert({
                             sale_id: sale_id,
                             status: 'authorized',
                             external_id: recoveryData.id || 'RECOVERED',
                             xml_url: recoveryData.xml,
                             pdf_url: recoveryData.pdf,
                             error_message: null, // Clear error
                             updated_at: new Date().toISOString()
                           }, { onConflict: 'sale_id' })

                         return new Response(
                           JSON.stringify({ 
                             message: 'Invoice Authorized (Recovered)', 
                             data: recoveryData 
                           }),
                           { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                         )
                     } else {
                         console.warn('[Fiscal] Recovery Fetch Failed:', await recoveryRes.text())
                     }
                 } catch (recErr) {
                     console.error('[Fiscal] Recovery Exception:', recErr)
                 }
            } else {
                console.warn('[Fiscal] Could not extract chNFe for recovery.')
            }
        }
        // -------------------------------------
        
        // Log rejection to DB
        await supabaseClient
          .from('invoice_logs')
          .upsert({
             sale_id: sale_id,
             status: 'rejected',
             error_message: errorMsg,
             updated_at: new Date().toISOString()
          }, { onConflict: 'sale_id' })
        
        return new Response(
          JSON.stringify({ error: 'Fiscal Rejection', details: errorMsg }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

    // Success
    console.log('[Fiscal] Success:', apiData)
    // Map response fields (adjust based on actual Nuvem Fiscal response structure)
    // 12. Success
    console.log('[Fiscal] Authorized! Updating log...')
    await supabaseClient
      .from('invoice_logs')
      .upsert({
        sale_id: sale_id,
        status: 'authorized',
        external_id: apiData.id || 'N/A',
        xml_url: apiData.xml || null, // Check correct field from Nuvem Fiscal
        pdf_url: apiData.pdf || null, // Check correct field
        updated_at: new Date().toISOString()
      }, { onConflict: 'sale_id' })

    return new Response(
      JSON.stringify({ 
        message: 'Invoice Authorized', 
        data: apiData 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[Fiscal] Critical Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    // Emergency Log to DB if we have sale_id
    if (sale_id_for_log) {
       try {
         const authHeader = req.headers.get('Authorization')
         if (authHeader) {
            const sbAdmin = createClient(
              Deno.env.get('SUPABASE_URL') ?? '',
              Deno.env.get('SUPABASE_ANON_KEY') ?? '',
              { global: { headers: { Authorization: authHeader } } }
            )
            await sbAdmin.from('invoice_logs').upsert({
                 sale_id: sale_id_for_log,
                 status: 'rejected',
                 error_message: errorMessage,
                 updated_at: new Date().toISOString()
            }, { onConflict: 'sale_id' })
         }
       } catch (logErr) {
         console.error('Failed to log error to DB:', logErr)
       }
    }

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
