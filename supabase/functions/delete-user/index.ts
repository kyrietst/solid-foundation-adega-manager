import { createClient } from '@supabase/supabase-js'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // Verificar autenticação
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            throw new Error('No authorization header')
        }

        const token = authHeader.replace('Bearer ', '')
        const {
            data: { user },
            error: userError,
        } = await supabaseClient.auth.getUser(token)

        if (userError || !user) {
            throw new Error('Invalid token')
        }

        // Verificar se o usuário é admin
        const { data: profile } = await supabaseClient
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (!profile || profile.role !== 'admin') {
            throw new Error('Unauthorized - Admin only')
        }

        // Obter o ID do usuário a ser deletado do corpo da requisição
        const { userId } = await req.json()
        if (!userId) {
            throw new Error('User ID is required')
        }

        // Verificar se não é o admin supremo
        const { data: userToDelete } = await supabaseClient
            .from('profiles')
            .select('email')
            .eq('id', userId)
            .single()

        if (userToDelete?.email === 'adm@adm.com') {
            throw new Error('Cannot delete supreme admin')
        }

        // Deletar o usuário
        const { error: deleteError } = await supabaseClient.auth.admin.deleteUser(
            userId
        )

        if (deleteError) {
            throw deleteError
        }

        return new Response(
            JSON.stringify({ message: 'User deleted successfully' }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Internal server error'
        return new Response(
            JSON.stringify({ error: errorMessage }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        )
    }
})
