/**
 * CORS Headers for Edge Functions
 *
 * Configuração centralizada de CORS para todas as Edge Functions.
 * Permite requisições do frontend em desenvolvimento e produção.
 */

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
