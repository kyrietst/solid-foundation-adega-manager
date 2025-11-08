/**
 * Edge Function: admin-reset-password
 *
 * Permite que administradores resetem a senha de outros usuários usando
 * o método nativo do Supabase (auth.admin.updateUserById).
 *
 * Esta função substitui a RPC obsoleta `admin_reset_user_password` com
 * uma arquitetura moderna e segura onde a SERVICE_ROLE key fica protegida
 * no servidor.
 *
 * Segurança:
 * - Requer autenticação (JWT token)
 * - Verifica se usuário autenticado é admin
 * - SERVICE_ROLE key nunca é exposta no frontend
 * - Rate limiting via Supabase
 *
 * @param {string} userId - ID do usuário que terá a senha resetada
 * @param {string} newPassword - Nova senha temporária
 * @returns {object} { success: boolean, error?: string }
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Validar autorização (JWT token do usuário)
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Criar cliente Supabase com service role (seguro no servidor)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // 3. Criar cliente regular para verificar permissões do usuário autenticado
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    // 4. Verificar se o usuário autenticado é admin
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized - invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 5. Buscar role do usuário autenticado
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ success: false, error: 'User profile not found' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (profile.role !== 'admin') {
      return new Response(
        JSON.stringify({ success: false, error: 'Forbidden - admin role required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 6. Extrair parâmetros da requisição
    const { userId, newPassword } = await req.json()

    if (!userId || !newPassword) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields: userId, newPassword' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 7. Validar senha (mínimo 8 caracteres)
    if (newPassword.length < 8) {
      return new Response(
        JSON.stringify({ success: false, error: 'Password must be at least 8 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 8. Resetar senha usando método nativo do Supabase
    const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    )

    if (updateError) {
      console.error('Error resetting password:', updateError)
      return new Response(
        JSON.stringify({ success: false, error: updateError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 9. Retornar sucesso
    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: updatedUser.user.id,
          email: updatedUser.user.email,
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
