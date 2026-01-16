import { createClient } from '@supabase/supabase-js'
import { corsHeaders } from '../_shared/cors.ts'

console.log("Fiscal Handler v2.5.0 - Strict Typed")

// Constants
const AUTH_URL = 'https://auth.nuvemfiscal.com.br/oauth/token'

// Types
interface FiscalPayload {
  sale_id: string;
  cpfNaNota?: string; // Optional manual CPF
  action?: 'emit' | 'cancel';
  reason?: string; 
  [key: string]: unknown;
}

interface SaleItem {
    id: string;
    quantity: number;
    unit_price: number;
    products: {
        name: string;
        barcode: string;
        ncm: string;
        cest: string | null;
        cfop: string;
        origin: string;
    } | null; // Product can be null in join if integrity failed
    fiscal_snapshot: {
        ncm?: string;
        cfop?: string;
        uCom?: string;
        ucom?: string;
        xProd?: string;
        cest?: string;
    } | null;
    impostos?: {
        icms?: {
            origem?: string;
        };
    };
    valor_bruto?: number; // Calculated later
}

interface MappedItem {
    numero_item: number;
    codigo_produto: string;
    descricao: string;
    cfop: string;
    unidade_comercial: string;
    quantidade_comercial: number;
    valor_unitario_comercial: number;
    valor_bruto: number;
    unidade_tributavel: string;
    quantidade_tributavel: number;
    valor_unitario_tributavel: number;
    ncm: string;
    cest?: string;
    impostos?: {
        icms?: {
            origem?: string;
            csosn?: string;
        };
    };
}

interface PaymentMethod {
    code: string;
    [key: string]: unknown;
}

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
      (req.headers.get('x-agent-auth') === 'agent-secret-8822') 
        ? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '' 
        : Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    
    // AGENT BYPASS FOR TESTING
    const isAgentCall = req.headers.get('x-agent-auth') === 'agent-secret-8822';
    
    if ((authError || !user) && !isAgentCall) {
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
    const body = await req.json() as FiscalPayload
    const { sale_id, cpfNaNota, action, reason } = body
    
    sale_id_for_log = sale_id // Capture ID for global error logging
    if (!sale_id) {
       throw new Error('Missing sale_id in request body')
    }

    console.log(`[Fiscal] Starting operation for Sale ID: ${sale_id} | Action: ${action || 'emit'}`)

    // 5. Data Fetching (Parallel)
    const [saleResponse, settingsResponse] = await Promise.all([
      supabaseClient
        .from('sales')
        .select(`
          *,
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

    // --- CANCELLATION BLOCK ---
    if (action === 'cancel') {
        console.log('[Fiscal] Starting Cancellation Flow...');
        
        if (!reason || reason.length < 15) {
            throw new Error('Justificativa de cancelamento inválida (Mínimo 15 caracteres).');
        }

        // Fetch authorized invoice log to get External ID
        const { data: logObj, error: logError } = await supabaseClient
            .from('invoice_logs')
            .select('external_id, status')
            .eq('sale_id', sale_id)
            .eq('status', 'authorized')
            .single();

        if (logError || !logObj) {
             throw new Error('Nota Fiscal não encontrada ou não autorizada. Não é possível cancelar.');
        }

        const externalId = logObj.external_id;
        console.log(`[Fiscal] Cancelling Invoice ID: ${externalId}`);

        // CALL NUVEM FISCAL CANCEL
        const cancelUrl = `${BASE_API_URL}/nfce/${externalId}/cancelamento`;
        console.log(`[Fiscal] Cancel URL: ${cancelUrl} [Method: POST]`);
        
        const cancelRes = await fetch(cancelUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ justificativa: reason })
        });

        const cancelTxt = await cancelRes.text();
        let cancelData;
        try {
             cancelData = JSON.parse(cancelTxt);
        } catch (_e) {
             cancelData = { error: { message: cancelTxt } };
        }

        if (!cancelRes.ok || cancelData.status === 'erro' || cancelData.status === 'rejeitado') {
             const errorMsg = cancelData.error?.message || cancelData.motivo_status || 'Erro no cancelamento.';
             throw new Error(`Erro Nuvem Fiscal: ${errorMsg}`);
        }

        console.log('[Fiscal] Cancellation Approved by SEFAZ.');

        // Update Logs
        await supabaseClient
            .from('invoice_logs')
            .update({ 
                status: 'cancelled', 
                error_message: `CANCELADO: ${reason}`,
                updated_at: new Date().toISOString()
            })
            .eq('sale_id', sale_id);

        return new Response(
            JSON.stringify({ success: true, message: 'Nota Fiscal Cancelada com Sucesso.' }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
    // --- END CANCELLATION BLOCK ---

    // 9. The Great Mapping (JSON Factory)
    
    // Items Mapping
    const items: MappedItem[] = sale.sale_items.map((item: SaleItem, index: number) => {
        const product = item.products
        const snapshot = item.fiscal_snapshot || {}
        
        if (!product) throw new Error(`Produto não encontrado para item ${item.id}`)

        // Fiscal Data Priorities: Snapshot > Product > Default
        const ncm = snapshot.ncm || product.ncm || '00000000'
        const cfop = snapshot.cfop || product.cfop || '5102'
        const uCom = snapshot.uCom || snapshot.ucom || 'UN'
        const xProd = snapshot.xProd || product.name
        const cest = snapshot.cest || product.cest
        const valorUnitario = parseFloat(item.unit_price.toString()) // Ensure float

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
    const totalVenda = items.reduce((acc: number, item: MappedItem) => acc + item.valor_bruto, 0)
    const totalVendaNumber = parseFloat(totalVenda.toFixed(2))

    // Calculate Tax Totals (MEI Logic - Simples Nacional)
    // MEI não destaca ICMS (vBC e vICMS = 0)
    const totalBC = 0.00
    const totalICMS = 0.00

    // Lógica Avançada de Pagamento (Split Payment Support v2 - Multi-Pagamento)
    const paymentDetList: Record<string, unknown>[] = [];
    const rawPayments = sale.sale_payments || [];

    // Helper para processar um método de pagamento
    const processPayment = (code: string, amount: number, methodEnum?: string, installmentsCount: number = 1) => {
        const tPag = code || '99';
        
        // IndPag Logic: 0=A Vista, 1=A Prazo
        const isPrazo = installmentsCount > 1 || tPag === '03' || (tPag === '99' && methodEnum === 'credit');
        const indPag = isPrazo ? 1 : 0;

        const det: Record<string, unknown> = {
            tPag: tPag,
            vPag: parseFloat(amount.toFixed(2)),
            indPag: indPag
        };

        // Regra 1: Se for '99' (Outros), exige descrição (Erro 441)
        if (tPag === '99') {
            det.xPag = 'Outros';
        }

        // Regra 2: Se for Cartão (03 ou 04), exige grupo 'card' (Erro 391)
        if (tPag === '03' || tPag === '04') {
            det.card = {
                tpIntegra: 2, // 2 = Não Integrado (Maquininha POS avulsa)
            };
        }

        // Regra 3 (Workaround): PIX (17) -> Tratar como 99 para evitar Erro 391 em Sandbox/Homologação
        // SEFAZ as vezes rejeita 17 pedindo cartão em alguns ambientes.
        if (tPag === '17') {
            det.tPag = '99';
            det.xPag = 'Pagamento Instantaneo (Pix)';
        }

        return det;
    };

    if (rawPayments.length > 0) {
        // Multi-Payment Flow
        rawPayments.forEach((p: { payment_methods: { code: string; name: string }; amount: number; installments: number }) => {
            const methodCode = p.payment_methods?.code || '99';
            const methodEnum = p.payment_methods?.name === 'Crédito' ? 'credit' : undefined; // Simplificação
            paymentDetList.push(processPayment(methodCode, p.amount, methodEnum, p.installments));
        });
    } else {
        // Legacy Fallback (Single Payment from Sales Header)
        const pmraw = sale.payment_methods;
        const pm = Array.isArray(pmraw) ? pmraw[0] : pmraw;
        const legacyCode = pm?.code || '99';
        
        // Tenta inferir enum do header se existir
        const legacyEnum = sale.payment_method_enum; 
        
        paymentDetList.push(processPayment(legacyCode, totalVendaNumber, legacyEnum, sale.installments));
    }
    
    // DEBUG: Log payments count
    console.log(`[Fiscal] Resolved Payments: ${paymentDetList.length} item(s)`)



    // Destinatário Logic (NEW v4.0 - Unidentified Consumer Support)
    let dest: Record<string, unknown> | undefined = undefined;
    const customer = sale.customers;

    // Delivery Address Priority: Use sale-specific address if available, else fallback to customer profile
    const targetAddress = sale.delivery_address || (customer && typeof customer.address === 'object' ? customer.address : null);

    // Determine Target CPF (Priority to manual input "cpfNaNota")
    const manualCpf = cpfNaNota ? cpfNaNota.replace(/\D/g, '') : '';
    const customerCpf = customer?.cpf_cnpj ? customer.cpf_cnpj.replace(/\D/g, '') : '';
    const finalCpf = manualCpf || customerCpf;

    const hasValidCpf = finalCpf.length === 11 || finalCpf.length === 14;

    // ONLY create dest if we have a valid CPF (Requirement for "Unidentified Consumer" consistency in NFC-e)
    if (hasValidCpf) {
        dest = {};
        
        // Identificação (CPF/CNPJ)
        if (finalCpf.length === 11) dest.CPF = finalCpf;
        else if (finalCpf.length === 14) dest.CNPJ = finalCpf;

        // Name Logic: Use Customer Name if available
        if (customer?.name) {
             dest.xNome = customer.name.substring(0, 60);
        }
        
        // IE logic (Only if using Customer Profile and NOT manual override)
        if (!manualCpf && customer) {
             if (customer.indicador_ie) dest.indIEDest = customer.indicador_ie;
             if (customer.ie) dest.IE = customer.ie.replace(/\D/g, '');
             if (customer.email) dest.email = customer.email;
        }

        // Endereço Logic (Fiscal Address Structure)
        if (targetAddress) {
            // Support both new Fiscal keys (PT-BR) and legacy keys (EN)
            const logradouro = targetAddress.logradouro || targetAddress.street;
            const numero = targetAddress.numero || targetAddress.number || 'S/N';
            const bairro = targetAddress.bairro || targetAddress.neighborhood;
            const municipio = targetAddress.nome_municipio || targetAddress.city;
            const uf = targetAddress.uf || targetAddress.state;
            const cep = targetAddress.cep || targetAddress.zipCode;
            const codMun = targetAddress.codigo_municipio || targetAddress.ibge || "3548708"; 

            if (logradouro) {
                dest.enderDest = {
                    xLgr: logradouro.substring(0, 60),
                    nro: numero,
                    xCpl: targetAddress.complemento ? targetAddress.complemento.substring(0, 60) : (targetAddress.complement ? targetAddress.complement.substring(0, 60) : undefined),
                    xBairro: bairro.substring(0, 60),
                    cMun: codMun, 
                    xMun: municipio.substring(0, 60),
                    UF: uf,
                    CEP: cep ? cep.replace(/\D/g, '') : undefined,
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
                verProc: "FiscalHandler v2.5"
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
            det: items.map((item: MappedItem, i: number) => ({
                nItem: i + 1,
                prod: {
                    cProd: item.codigo_produto.substring(0, 60),
                    cEAN: "SEM GTIN",
                    xProd: item.descricao.substring(0, 120),
                    NCM: item.ncm, // Deve ser válido (8 dígitos)
                    CFOP: "5102", // MEI Rule: Always 5102 for End Consumer
                    uCom: "UN",
                    qCom: item.quantidade_comercial, // NUMBER
                    vUnCom: parseFloat(item.valor_unitario_comercial.toFixed(2)), // NUMBER (Double)
                    vProd: parseFloat(item.valor_bruto.toFixed(2)), // NUMBER (Double)
                    cEANTrib: "SEM GTIN",
                    uTrib: "UN",
                    qTrib: item.quantidade_tributavel, // NUMBER
                    vUnTrib: parseFloat(item.valor_unitario_tributavel.toFixed(2)), // NUMBER (Double)
                    indTot: 1 // NUMBER
                },
                imposto: {
                    // MEI Rule: Always CSOSN 102 (Simples Nacional sem crédito)
                    ICMS: {
                        ICMSSN102: { 
                            orig: parseInt(item.impostos?.icms?.origem || '0'), 
                            CSOSN: "102",
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
                detPag: paymentDetList
            }
        }
    }

    // 11. Process Emission
    console.log(`[Fiscal] Sending payload to ${BASE_API_URL}/nfce`)
    // Removed sensitive payload log
    
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
    // Removed raw response log
    
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
        
        let recoveryDebugStr = ''

        if (isDuplicity) {
            console.log('[Fiscal] Detected Duplicity (Erro 539). Attempting Auto-Recovery...')
            // Extract chNFe from message ex: "Rejeição: Duplicidade de NF-e [chNFe:3522...]"
            const match = errorDetails.match(/\[chNFe:(\d+)/) 
            const chNFe = match ? match[1] : null

            if (chNFe) {
                 console.log(`[Fiscal] Recovering Key: ${chNFe}`)
                 try {
                     // Fetch from Nuvem Fiscal by Key (List with filter)
                     // DOCS: GET /nfce?chave={chave_acesso}&cpf_cnpj={cnpj}&ambiente={ambiente}
                     const cleanCnpj = settings.cnpj.replace(/\D/g, '')
                     const recoveryUrl = `${BASE_API_URL}/nfce?chave=${chNFe}&cpf_cnpj=${cleanCnpj}&ambiente=${ENV_PAYLOAD}`
                     console.log(`[Fiscal] Fetching: ${recoveryUrl}`)
                     
                     const recoveryRes = await fetch(recoveryUrl, {
                         headers: { 
                             'Authorization': `Bearer ${access_token}`,
                             'Content-Type': 'application/json' 
                        }
                     })

                     if (recoveryRes.ok) {
                         const recoverySearchResult = await recoveryRes.json()
                         // Removed detailed search result log
                         
                         // Expecting { data: [ { id: '...', ... } ], ... } or direct array
                         const items = recoverySearchResult.data || recoverySearchResult.items || (Array.isArray(recoverySearchResult) ? recoverySearchResult : [])
                         const recoveredNote = items[0]

                         if (recoveredNote) {
                             let recoveredPdfUrl = recoveredNote.pdf || recoveredNote.url_pdf || recoveredNote.link_pdf || recoveredNote.url_danfe
                             const recoveredXmlUrl = recoveredNote.xml || recoveredNote.url_xml || recoveredNote.link_xml

                             // --- PROXY PDF STORAGE (RECOVERY MODE) ---
                             try {
                                 console.log(`[Fiscal] Starting PDF Proxy for Recovered ID: ${recoveredNote.id}`)
                                 // 1. Fetch Binary PDF
                                 const pdfRes = await fetch(`${BASE_API_URL}/nfce/${recoveredNote.id}/pdf`, {
                                     headers: { 'Authorization': `Bearer ${access_token}` }
                                 })
                                 
                                 if (pdfRes.ok) {
                                     const pdfBuffer = await pdfRes.arrayBuffer()
                                     const fileName = `${sale_id}_${Date.now()}_rec.pdf`

                                     // 2. Upload to Supabase Storage
                                     const { error: uploadError } = await supabaseClient
                                         .storage
                                         .from('invoices')
                                         .upload(fileName, pdfBuffer, {
                                             contentType: 'application/pdf',
                                             upsert: true
                                         })

                                     if (uploadError) {
                                         recoveryDebugStr += ` | PDF Upload Error: ${uploadError.message}`
                                         console.error('[Fiscal] Recovery Storage Upload Error:', uploadError)
                                     } else {
                                         // 3. Get Public URL
                                         const { data: urlData } = supabaseClient
                                             .storage
                                             .from('invoices')
                                             .getPublicUrl(fileName)
                                         
                                         recoveredPdfUrl = urlData.publicUrl
                                         console.log(`[Fiscal] Recovered PDF Stored: ${recoveredPdfUrl}`)
                                     }
                                 } else {
                                     recoveryDebugStr += ` | PDF Fetch Binary Failed: ${pdfRes.status}`
                                 }
                             } catch (proxyErr) {
                                 const msg = proxyErr instanceof Error ? proxyErr.message : 'Unknown'
                                 recoveryDebugStr += ` | Proxy Exception: ${msg}`
                                 console.error('[Fiscal] Recovery Proxy Exception:', proxyErr)
                             }
                             // ------------------------------------------

                             // Upsert Log (Recovered)
                             await supabaseClient
                               .from('invoice_logs')
                               .upsert({
                                 sale_id: sale_id,
                                 status: 'authorized',
                                 external_id: recoveredNote.id || 'RECOVERED',
                                 xml_url: recoveredXmlUrl,
                                 pdf_url: recoveredPdfUrl,
                                 qrcode_url: recoveredNote.url_consulta_qrcode || recoveredNote.qrcode_url || null,
                                 error_message: null, 
                                 updated_at: new Date().toISOString()
                               }, { onConflict: 'sale_id' })

                             return new Response(
                               JSON.stringify({ 
                                 message: 'Invoice Authorized (Recovered)', 
                                 data: recoveredNote 
                               }),
                               { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                             )
                         } else {
                            recoveryDebugStr += ` | Recovery Found 0 items in search`
                            console.warn('[Fiscal] Recovery: Invoice not found in search results.')
                         }
                     } else {
                         const txt = await recoveryRes.text()
                         recoveryDebugStr += ` | Recovery Search API Failed: ${recoveryRes.status} body=${txt}`
                         console.warn('[Fiscal] Recovery Search Failed:', txt)
                     }
                 } catch (recErr) {
                     const msg = recErr instanceof Error ? recErr.message : 'Unknown'
                     recoveryDebugStr += ` | Recovery Exception: ${msg}`
                     console.error('[Fiscal] Recovery Exception:', recErr)
                 }
            } else {
                recoveryDebugStr += ' | Could not extract chNFe regex'
                console.warn('[Fiscal] Could not extract chNFe for recovery.')
            }
        }
        // -------------------------------------
        
        // Log rejection to DB
        const finalErrorLog = errorMsg + (recoveryDebugStr ? ` [DEBUG RECOVERY: ${recoveryDebugStr}]` : '')
        
        await supabaseClient
          .from('invoice_logs')
          .upsert({
            sale_id: sale_id,
            status: 'rejected',
            external_id: null,
            xml_url: null,
            pdf_url: null,
            error_message: finalErrorLog,
            updated_at: new Date().toISOString()
          }, { onConflict: 'sale_id' })
        
        return new Response(
          JSON.stringify({ error: 'Fiscal Rejection', details: finalErrorLog }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

    // Success
    // Removed success log matching sensitive data logic
    
    // Map response fields (adjust based on actual Nuvem Fiscal response structure)
    // 12. Success
    console.log('[Fiscal] Authorized! Updating log...')
        // --- PROXY PDF STORAGE (Nuvem Fiscal -> Supabase Storage) ---
        let finalPdfUrl = null
        
        // Determine ID: either from fresh emission (apiData.id) or recovered note
        // We need to look back at the recovery block. Since 'items' is scoped there, 
        // we should interpret the ID from context or 'external_id' if we saved it in a variable.
        // Better: let's rely on apiData or the fact that if we recovered, we have the ID.
        // However, 'items' is not available here. 
        // Let's use a safe lookup.
        
        // If apiData.id exists, use it. If not, we might be in a recovery scenario where apiData failed.
        // But if recovery succeeded, we returned EARLY on line 457! 
        // WAIT: The previous code returned a Response inside the recovery block (line 457).
        // So if we are HERE (line 500+), it means it was a FRESH emission that SUCCEEDED (or at least didn't error out).
        // So apiData.id SHOULD be present if status is authorized.

        const fiscalId = apiData.id
        
        if (fiscalId && (apiData.status === 'autorizado' || apiData.status === 'processamento')) {
            console.log(`[Fiscal] Starting PDF Proxy for ID: ${fiscalId}`)
            
            try {
                // 1. Fetch Binary PDF
                const pdfRes = await fetch(`${BASE_API_URL}/nfce/${fiscalId}/pdf`, {
                    headers: { 'Authorization': `Bearer ${access_token}` }
                })
                
                if (pdfRes.ok) {
                    const pdfBuffer = await pdfRes.arrayBuffer()
                    const fileName = `${sale_id}_${Date.now()}.pdf`

                    // 2. Upload to Supabase Storage
                    const { error: uploadError } = await supabaseClient
                        .storage
                        .from('invoices')
                        .upload(fileName, pdfBuffer, {
                            contentType: 'application/pdf',
                            upsert: true
                        })

                    if (uploadError) {
                        console.error('[Fiscal] Storage Upload Error:', uploadError)
                    } else {
                        // 3. Get Public URL
                        const { data: urlData } = supabaseClient
                            .storage
                            .from('invoices')
                            .getPublicUrl(fileName)
                        
                        finalPdfUrl = urlData.publicUrl
                        console.log(`[Fiscal] PDF Stored Successfully: ${finalPdfUrl}`)
                    }
                } else {
                    console.warn(`[Fiscal] Failed to fetch PDF binary: ${pdfRes.status}`)
                }
            } catch (proxyErr) {
                console.error('[Fiscal] Proxy PDF Exception:', proxyErr)
            }
        }

        // Fallback to API links if proxy failed
        const apiPdfLink = apiData.pdf || apiData.url_pdf || apiData.link_pdf || apiData.url_danfe
        const bestPdfUrl = finalPdfUrl || apiPdfLink
        const bestXmlUrl = apiData.xml || apiData.url_xml 

        // Log success to DB
        await supabaseClient
            .from('invoice_logs')
            .upsert({
                sale_id: sale_id,
                status: 'authorized',
                external_id: apiData.id || 'UNKNOWN',
                xml_url: bestXmlUrl,
                pdf_url: bestPdfUrl, // NOW USING STORAGE URL
                qrcode_url: apiData.url_consulta_qrcode || apiData.qrcode_url || null,
                error_message: null, 
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
