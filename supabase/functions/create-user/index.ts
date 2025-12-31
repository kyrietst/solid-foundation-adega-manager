import { createClient } from '@supabase/supabase-js'
import { corsHeaders } from '../_shared/cors.ts'

const handleError = (error: unknown) => {
    console.error('Error details:', error)
    const message = error instanceof Error ? error.message : 'An unknown error occurred'
    return new Response(
        JSON.stringify({
            error: message,
            details: error
        }),
        {
            status: 200, // Sempre retornar 200 para evitar erro de CORS
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
    )
}

Deno.serve(async (req: Request) => {
    try {
        // Handle CORS preflight
        if (req.method === 'OPTIONS') {
            return new Response('ok', { headers: corsHeaders })
        }

        // Get env variables
        const supabaseUrl = Deno.env.get('SUPABASE_URL')
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

        if (!supabaseUrl || !supabaseServiceKey) {
            throw new Error('Environment variables are not properly configured')
        }

        // Create Supabase client
        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // Get authorization header
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            throw new Error('Missing authorization header')
        }

        // Verify caller
        const token = authHeader.replace('Bearer ', '')
        const { data: { user: caller }, error: verifyError } = await supabase.auth.getUser(token)

        if (verifyError || !caller) {
            throw new Error('Unauthorized')
        }

        // Verify if caller is admin
        const { data: roles } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', caller.id)
            .single()

        if (!roles || roles.role !== 'admin') {
            throw new Error('Unauthorized: Admin access required')
        }

        // Get request body
        const { email, password, name, role } = await req.json()

        // Validate inputs
        if (!email || !password || !name || !role) {
            throw new Error('Missing required fields')
        }

        // Check if user already exists
        const { data: existingUser } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', email)
            .single()

        if (existingUser) {
            throw new Error('Este email já está em uso')
        }

        // Create user
        const { data: userData, error: createError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { name }
        })

        if (createError) {
            if (createError.message.includes('User already registered')) {
                throw new Error('Este email já está em uso')
            }
            throw createError
        }

        if (!userData.user) {
            throw new Error('Failed to create user')
        }

        // Create profile using upsert to handle potential duplicates
        const { error: profileError } = await supabase
            .from('profiles')
            .upsert(
                {
                    id: userData.user.id,
                    name,
                    email,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                },
                { onConflict: 'id' }
            )

        if (profileError) {
            // Cleanup: delete user if profile creation fails
            await supabase.auth.admin.deleteUser(userData.user.id)
            throw profileError
        }

        // Create role
        const { error: roleError } = await supabase
            .from('user_roles')
            .insert({
                id: crypto.randomUUID(),
                user_id: userData.user.id,
                role,
                created_at: new Date().toISOString()
            })

        if (roleError) {
            // Cleanup: delete user if role creation fails
            await supabase.auth.admin.deleteUser(userData.user.id)
            throw roleError
        }

        // Return success response
        return new Response(
            JSON.stringify({
                success: true,
                user: userData.user
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            }
        )

    } catch (error) {
        return handleError(error)
    }
})
