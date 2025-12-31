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

import { createClient } from '@supabase/supabase-js'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
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
          persistSession: false
        }
      }
    )

    // 3. Validar se o solicitante é realmente um administrador
    const token = authHeader.replace('Bearer ', '')
    const { data: { user: caller }, error: userError } = await supabaseAdmin.auth.getUser(token)

    if (userError || !caller) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 4. Verificar role na tabela user_roles ou profiles
    // A query abaixo depende da sua estrutura de roles. Ajuste conforme necessário.
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('profiles') // ou user_roles
      .select('role')
      .eq('id', caller.id)
      .single()

    if (roleError || roleData?.role !== 'admin') {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized: Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 5. Parse do corpo da requisição
    const { userId, newPassword } = await req.json()

    if (!userId || !newPassword) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields: userId, newPassword' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 6. Validar segurança da senha (opcional, mas recomendado)
    if (newPassword.length < 6) {
      return new Response(
        JSON.stringify({ success: false, error: 'Password must be at least 6 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 7. Atualizar a senha do usuário alvo
    const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    )

    // 8. Tratar erros de update
    if (updateError) {
      console.error('Error resetting password:', updateError)
      return new Response(
        JSON.stringify({ success: false, error: updateError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 9. CRÍTICO: Marcar senha como temporária na tabela profiles
    // Isto garante que o modal de troca de senha seja exibido no próximo login
    const { error: profileError2 } = await supabaseAdmin
      .from('profiles')
      .update({ is_temporary_password: true })
      .eq('id', userId)

    if (profileError2) {
      console.error('Error setting temporary password flag:', profileError2)
      // ⚠️ Não falhar a operação inteira se apenas a flag falhar
      // A senha já foi resetada com sucesso
      console.warn('Password was reset but temporary flag could not be set')
    }

    // 10. Retornar sucesso
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

  } catch (error: unknown) {
    console.error('Unexpected error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
