import "jsr:@supabase/functions-js/edge-runtime.d.ts"

Deno.serve(async (req) => {
    return new Response(
        JSON.stringify({ message: "Placeholder for delete-user function. Needs implementation matching Prod." }),
        { headers: { "Content-Type": "application/json" } },
    )
})
